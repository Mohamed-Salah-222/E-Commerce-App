import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import Skeleton from "./Skeleton";

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
};

function AdminUsersPage() {
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promotingUser, setPromotingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
        const data = await response.json();
        const usersList = data.users || data;
        setUsers(Array.isArray(usersList) ? usersList : []);
      } catch (err) {
        setError(err.message);
        showNotification(err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handlePromoteToAdmin = async (userId) => {
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
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, admin: true } : u)));
      showNotification("User promoted to admin!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setPromotingUser(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (!user) return false;
      const term = searchTerm.toLowerCase();
      const matchesSearch = (user.username || "").toLowerCase().includes(term) || (user.email || "").toLowerCase().includes(term);
      const matchesRole = filterRole === "all" || (filterRole === "admin" && user.admin) || (filterRole === "user" && !user.admin);
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u?.admin).length,
      regular: users.filter((u) => u && !u.admin).length,
    }),
    [users],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 flex-1 max-w-md rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium mb-4">Error: {error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage roles and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: stats.total },
          { label: "Admins", value: stats.admins },
          { label: "Regular Users", value: stats.regular },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/10">
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id || user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold">{user.username ? user.username.charAt(0).toUpperCase() : "U"}</div>
                        <span className="text-sm font-medium text-gray-900">{user.username || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email || "No email"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${user.admin ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>{user.admin ? "Admin" : "User"}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.createdAt ? formatDate(user.createdAt) : "Unknown"}</td>
                    <td className="px-6 py-4">
                      {!user.admin ? (
                        <button onClick={() => handlePromoteToAdmin(user._id)} disabled={promotingUser === user._id} className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                          {promotingUser === user._id ? "Promoting..." : "Make Admin"}
                        </button>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">Admin</span>
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
