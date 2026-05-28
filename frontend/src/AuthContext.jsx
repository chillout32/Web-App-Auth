import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("jwt") || null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [decodedJwt, setDecodedJwt] = useState(() => {
    const stored = localStorage.getItem("decoded");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((token, user, decoded) => {
    setToken(token);
    setUser(user);
    setDecodedJwt(decoded);
    localStorage.setItem("jwt", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("decoded", JSON.stringify(decoded));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setDecodedJwt(null);
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    localStorage.removeItem("decoded");
  }, []);

  // Authenticated fetch wrapper — adds Authorization header automatically
  const apiFetch = useCallback(
    async (path, options = {}) => {
      const res = await fetch(`/api${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    },
    [token]
  );

  return (
    <AuthContext.Provider value={{ token, user, decodedJwt, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
