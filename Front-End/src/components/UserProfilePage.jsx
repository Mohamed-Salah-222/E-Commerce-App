import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function UserProfilePage() {
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });
  const [loading, setLoading] = useState(true);

  // Fetch the user's current profile data when the page loads
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch profile.");
        const data = await response.json();
        // Set the form state with the fetched data
        setProfile({
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || { street: "", city: "", postalCode: "", country: "" },
        });
      } catch (error) {
        showNotification(error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [token]);

  // Handle changes in any of the form input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    // If the input is part of the nested address object
    if (["street", "city", "postalCode", "country"].includes(name)) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        address: {
          ...prevProfile.address,
          [name]: value,
        },
      }));
    } else {
      // For top-level fields like username and phone
      setProfile((prevProfile) => ({
        ...prevProfile,
        [name]: value,
      }));
    }
  };

  // Handle form submission to update the profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: profile.username,
          phone: profile.phone,
          address: profile.address,
        }),
      });
      if (!response.ok) throw new Error("Failed to update profile.");

      showNotification("Profile updated successfully!", "success");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading your profile...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-slide-down">My Profile</h1>

        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 backdrop-blur-sm bg-opacity-95 transform hover:scale-[1.02] transition-all duration-300 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="group">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
                    Username
                  </label>
                  <div className="relative">
                    <input type="text" name="username" id="username" value={profile.username} onChange={handleChange} className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-5 transition-opacity duration-200 pointer-events-none"></div>
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input type="email" name="email" id="email" value={profile.email} readOnly className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm bg-gradient-to-br from-gray-50 to-gray-100 cursor-not-allowed text-gray-600 relative overflow-hidden" />
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="group">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
                  Phone Number
                </label>
                <div className="relative">
                  <input type="tel" name="phone" id="phone" value={profile.phone} onChange={handleChange} className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-5 transition-opacity duration-200 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-white px-4">
                  <div className="w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">Shipping Address</h2>
              </div>

              {/* Street Address */}
              <div className="group">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
                  Street Address
                </label>
                <div className="relative">
                  <input type="text" name="street" id="street" value={profile.address.street} onChange={handleChange} className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-5 transition-opacity duration-200 pointer-events-none"></div>
                </div>
              </div>

              {/* City, Postal Code, Country */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
                    City
                  </label>
                  <div className="relative">
                    <input type="text" name="city" id="city" value={profile.address.city} onChange={handleChange} className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-5 transition-opacity duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
                    Postal Code
                  </label>
                  <div className="relative">
                    <input type="text" name="postalCode" id="postalCode" value={profile.address.postalCode} onChange={handleChange} className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-5 transition-opacity duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors duration-200">
                    Country
                  </label>
                  <div className="relative">
                    <input type="text" name="country" id="country" value={profile.address.country} onChange={handleChange} className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-5 transition-opacity duration-200 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8 text-right">
              <button type="submit" className="group relative px-8 py-4 font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl hover:shadow-2xl focus:ring-4 focus:ring-purple-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <span className="relative flex items-center space-x-2">
                  <span>Save Profile</span>
                  <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center group-hover:rotate-180 transition-transform duration-300">
                    <div className="w-2 h-2 bg-white rounded-full transform group-hover:scale-110 transition-transform duration-200"></div>
                  </div>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}

export default UserProfilePage;
