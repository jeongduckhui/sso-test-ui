import { useEffect, useRef, useState } from "react";
import { api } from "../api/axios";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }) {
  const initializedRef = useRef(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initAuth = async () => {
      try {
        const me = await api.get("/auth/me");
        setUser(me.data);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
