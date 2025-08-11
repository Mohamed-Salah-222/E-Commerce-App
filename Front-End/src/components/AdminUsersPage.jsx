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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 p-6 space-y-10">

      <div className="backdrop-blur-md bg-white/80 rounded-3xl p-8 shadow-xl border border-white/20">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 tracking-tight">User Management</h1>
          <p className="text-slate-600 text-lg font-medium">Manage user roles and permissions with precision</p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full mx-auto mt-4"></div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-4 right-4 opacity-20">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="relative">
            <div className="text-cyan-100 text-sm font-semibold mb-2 uppercase tracking-wider">Total Users</div>
            <div className="text-4xl font-black text-white mb-2">{users.length}</div>
            <div className="w-16 h-1 bg-cyan-300 rounded-full"></div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-4 right-4 opacity-20">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
          </div>
          <div className="relative">
            <div className="text-emerald-100 text-sm font-semibold mb-2 uppercase tracking-wider">Admins</div>
            <div className="text-4xl font-black text-white mb-2">{users.filter((u) => u && u.admin).length}</div>
            <div className="w-16 h-1 bg-emerald-300 rounded-full"></div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-4 right-4 opacity-20">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          </div>
          <div className="relative">
            <div className="text-orange-100 text-sm font-semibold mb-2 uppercase tracking-wider">Regular Users</div>
            <div className="text-4xl font-black text-white mb-2">{users.filter((u) => u && !u.admin).length}</div>
            <div className="w-16 h-1 bg-orange-300 rounded-full"></div>
          </div>
        </div>
      </div>


      <div className="backdrop-blur-md bg-white/90 rounded-3xl p-8 shadow-xl border border-white/20">
        <div className="flex flex-col md:flex-row gap-6 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-lg placeholder-slate-400 shadow-sm hover:shadow-md" />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-lg font-medium shadow-sm hover:shadow-md min-w-[180px]">
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 font-medium bg-slate-100 px-4 py-2 rounded-xl">
            Showing <span className="font-bold text-cyan-600">{filteredUsers.length}</span> of <span className="font-bold text-slate-800">{users.length}</span> users
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
            <span>Live data</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-8">
              <svg className="w-14 h-14 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-600 mb-3">No users found</h3>
            <p className="text-slate-500 text-lg">Try adjusting your search criteria to find users</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">User</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Email</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Role</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Joined</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredUsers.map((user, index) => (
                  <tr key={user._id || user.id} className={`group transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 ${index !== filteredUsers.length - 1 ? "border-b border-slate-100" : ""}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                          <div className="h-14 w-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">{user.username ? user.username.charAt(0).toUpperCase() : "U"}</div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition-colors duration-300">{user.username || "Unknown"}</div>
                          <div className="text-sm text-slate-500">{user.admin ? "Administrator" : "Standard User"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-medium text-slate-700">{user.email || "No email"}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 ${user.admin ? "bg-emerald-500/90 text-white shadow-emerald-500/25" : "bg-slate-500/90 text-white shadow-slate-500/25"}`}>
                        {user.admin ? (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            </svg>
                            Admin
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            User
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-medium text-slate-600">{user.createdAt ? formatDate(user.createdAt) : "Unknown"}</div>
                    </td>
                    <td className="px-8 py-6">
                      {!user.admin ? (
                        <button
                          onClick={() => handlePromoteToAdmin(user._id)}
                          disabled={promotingUser === user._id}
                          className="group/btn relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative flex items-center">
                            {promotingUser === user._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Promoting...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                Make Admin
                              </>
                            )}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center text-emerald-600 font-semibold">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                          Already Admin
                        </div>
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
