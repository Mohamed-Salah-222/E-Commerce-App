import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import Skeleton from "../layout/Skeleton";

function UserProfilePage() {
  const { token, refetchUser } = useAuth();
  const { showNotification } = useNotification();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    address: { street: "", city: "", postalCode: "", country: "", phone: "" },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch profile.");
        const data = await response.json();
        setProfile({
          username: data.username || "",
          email: data.email || "",
          address: data.address || { street: "", city: "", postalCode: "", country: "", phone: "" },
        });
      } catch (err) {
        showNotification(err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["street", "city", "postalCode", "country", "phone"].includes(name)) {
      setProfile((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: profile.username, address: profile.address }),
      });
      if (!response.ok) throw new Error("Failed to update profile.");
      await refetchUser();
      showNotification("Profile updated!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-colors";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-36" />
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-3 w-28 mb-2" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Skeleton className="h-11 w-32 rounded-xl ml-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-4">Personal Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
                  Username
                </label>
                <input type="text" name="username" id="username" value={profile.username} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input type="email" name="email" id="email" value={profile.email} readOnly className={`${inputClass} bg-gray-100 cursor-not-allowed text-gray-500`} />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">
              Phone Number
            </label>
            <input type="tel" name="phone" id="phone" value={profile.address.phone} onChange={handleChange} className={inputClass} />
          </div>

          <hr className="border-gray-100" />

          {/* Shipping Address */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-4">Shipping Address</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-600 mb-1">
                  Street Address
                </label>
                <input type="text" name="street" id="street" value={profile.address.street} onChange={handleChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1">
                    City
                  </label>
                  <input type="text" name="city" id="city" value={profile.address.city} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-600 mb-1">
                    Postal Code
                  </label>
                  <input type="text" name="postalCode" id="postalCode" value={profile.address.postalCode} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-600 mb-1">
                    Country
                  </label>
                  <input type="text" name="country" id="country" value={profile.address.country} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfilePage;
