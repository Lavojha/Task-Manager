/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

const storageKey = "task-manager-auth";

const getInitialAuth = () => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return { token: "", user: null };

  try {
    return JSON.parse(raw);
  } catch {
    return { token: "", user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [{ token, user }, setAuth] = useState(getInitialAuth);

  const persist = (data) => {
    setAuth(data);
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const login = async (email, password) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    persist({ token: response.data.token, user: response.data.user });
  };

  const signup = async (payload) => {
    const response = await apiRequest("/auth/signup", {
      method: "POST",
      body: payload,
    });
    persist({ token: response.data.token, user: response.data.user });
  };

  const logout = () => {
    persist({ token: "", user: null });
  };

  useEffect(() => {
    const verifySession = async () => {
      if (!token) return;

      try {
        const response = await apiRequest("/auth/me", { token });
        if (response?.data?._id) {
          persist({ token, user: response.data });
        }
      } catch (error) {
        if (error?.status === 401) {
          logout();
        }
      }
    };

    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
};
