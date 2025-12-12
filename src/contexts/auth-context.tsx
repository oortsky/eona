"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { Models } from "appwrite";
import { ID } from "appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  session: Models.Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sendMagicLink: (email: string, redirectUrl: string) => Promise<void>;
  verifyMagicLink: (userId: string, secret: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [session, setSession] = useState<Models.Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current session and user on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const currentUser = await account.get();
      setUser(currentUser);

      const currentSession = await account.getSession("current");
      setSession(currentSession);
    } catch (error) {
      // User not logged in
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMagicLink = async (email: string, redirectUrl: string) => {
    try {
      await account.createMagicURLToken(ID.unique(), email, redirectUrl);
    } catch (error) {
      console.error("Failed to send magic link:", error);
      throw error;
    }
  };

  const verifyMagicLink = async (userId: string, secret: string) => {
    try {
      const newSession = await account.createSession(userId, secret);
      setSession(newSession);

      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to verify magic link:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Failed to logout:", error);
      throw error;
    }
  };

  const refreshSession = async () => {
    await checkAuth();
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    sendMagicLink,
    verifyMagicLink,
    logout,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
