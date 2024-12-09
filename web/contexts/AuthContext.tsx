"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
