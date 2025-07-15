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
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">My Profile</h1>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input type="text" name="username" id="username" value={profile.username} onChange={handleChange} className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm" />
            </div>
            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input type="email" name="email" id="email" value={profile.email} readOnly className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input type="tel" name="phone" id="phone" value={profile.phone} onChange={handleChange} className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm" />
          </div>

          <hr className="my-8" />

          <h2 className="text-xl font-semibold text-gray-800">Shipping Address</h2>

          {/* Street Address */}
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input type="text" name="street" id="street" value={profile.address.street} onChange={handleChange} className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm" />
          </div>

          {/* City, Postal Code, Country */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input type="text" name="city" id="city" value={profile.address.city} onChange={handleChange} className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm" />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input type="text" name="postalCode" id="postalCode" value={profile.address.postalCode} onChange={handleChange} className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm" />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input type="text" name="country" id="country" value={profile.address.country} onChange={handleChange} className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm" />
            </div>
          </div>

          <div className="pt-6 text-right">
            <button type="submit" className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity shadow-lg">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfilePage;
