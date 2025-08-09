import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          const decodedUser = jwtDecode(storedToken);
          setToken(storedToken);
          console.log("Decoded user from JWT:", decodedUser); // Debug log

          // Try to fetch fresh user data, fallback to decoded token if it fails
          try {
            console.log("Fetching fresh user data on init..."); // Debug log
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const userData = await response.json();
              console.log("Fresh user data from API:", userData); // Debug log
              setUser(userData);
            } else {
              console.log("API call failed, using decoded JWT data"); // Debug log
              setUser(decodedUser);
            }
          } catch (error) {
            console.error("Failed to fetch user data on init:", error);
            console.log("Error occurred, using decoded JWT data"); // Debug log
            setUser(decodedUser);
          }
        }
      } catch (error) {
        console.error("Invalid token found in storage", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (newToken) => {
    localStorage.setItem("token", newToken);
    const decodedUser = jwtDecode(newToken);
    setToken(newToken);

    // Try to fetch fresh user data, fallback to decoded token if it fails
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${newToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(decodedUser);
      }
    } catch (error) {
      console.error("Failed to fetch user data on login:", error);
      setUser(decodedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const refetchUser = async () => {
    if (!token) {
      console.log("No token available for refetch");
      return;
    }

    try {
      console.log("Refetching user data..."); // Debug log
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      console.log("New user data:", userData); // Debug log
      setUser(userData);
      console.log("User state updated"); // Debug log
    } catch (error) {
      console.error("Failed to refetch user:", error);
      // Optionally handle token expiration
      if (error.message === "Unauthorized") {
        logout();
      }
    }
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
