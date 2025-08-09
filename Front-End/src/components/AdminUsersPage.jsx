import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function AdminUsersPage() {
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promotingUser, setPromotingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Debug logs
  useEffect(() => {
    console.log("AdminUsersPage mounted");
    console.log("Token:", token ? "Present" : "Missing");
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    console.log("Fetching users...");
    try {
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched data:", data);

      // Handle both possible response formats
      const usersList = data.users || data;
      setUsers(Array.isArray(usersList) ? usersList : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
      if (showNotification) {
        showNotification(error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    console.log("Promoting user:", userId);
    setPromotingUser(userId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/user/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to promote user");
      }

      // Update local state
      setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, admin: true } : user)));

      if (showNotification) {
        showNotification("User successfully promoted to admin!", "success");
      }
    } catch (error) {
      console.error("Promotion error:", error);
      if (showNotification) {
        showNotification(error.message, "error");
      }
    } finally {
      setPromotingUser(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (!user) return false;

    const matchesSearch = (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) || (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || (filterRole === "admin" && user.admin) || (filterRole === "user" && !user.admin);

    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid Date";
    }
  };

  // Error boundary
  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error Loading Users</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchUsers} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering with users:", users.length);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user roles and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="text-blue-600 text-sm font-medium mb-1">Total Users</div>
          <div className="text-3xl font-bold text-blue-800">{users.length}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="text-green-600 text-sm font-medium mb-1">Admins</div>
          <div className="text-3xl font-bold text-green-800">{users.filter((u) => u && u.admin).length}</div>
        </div>
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
          <div className="text-orange-600 text-sm font-medium mb-1">Regular Users</div>
          <div className="text-3xl font-bold text-orange-800">{users.filter((u) => u && !u.admin).length}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">{user.username ? user.username.charAt(0).toUpperCase() : "U"}</div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username || "Unknown"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email || "No email"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.admin ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{user.admin ? "Admin" : "User"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdAt ? formatDate(user.createdAt) : "Unknown"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {!user.admin ? (
                        <button onClick={() => handlePromoteToAdmin(user._id)} disabled={promotingUser === user._id} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          {promotingUser === user._id ? "Promoting..." : "Make Admin"}
                        </button>
                      ) : (
                        <span className="text-gray-400">Already Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsersPage;
