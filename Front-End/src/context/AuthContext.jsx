import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

function isTokenExpired(token) {
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return false;
    // buffer
    return Date.now() >= exp * 1000 - 10000;
  } catch {
    return true;
  }
}

async function fetchUserFromAPI(authToken) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error(`API returned ${response.status}`);
  return response.json();
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");

        if (!storedToken || isTokenExpired(storedToken)) {
          if (storedToken) localStorage.removeItem("token");
          return;
        }

        const decodedUser = jwtDecode(storedToken);
        setToken(storedToken);
     
        setUser(decodedUser);


        try {
          const freshUser = await fetchUserFromAPI(storedToken);
          setUser(freshUser);
        } catch {
          // Decoded JWT data is already set, so the app works either way
        }
      } catch {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    const decodedUser = jwtDecode(newToken);
    setUser(decodedUser);

    try {
      const freshUser = await fetchUserFromAPI(newToken);
      setUser(freshUser);
    } catch {
      // Decoded JWT data is already set as fallback
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const refetchUser = useCallback(async () => {
    if (!token) return;

    try {
      const freshUser = await fetchUserFromAPI(token);
      setUser(freshUser);
    } catch (error) {
      if (error.message.includes("401")) {
        logout();
      }
    }
  }, [token, logout]);

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    refetchUser,
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
