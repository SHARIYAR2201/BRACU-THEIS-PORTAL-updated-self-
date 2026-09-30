import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "./Auth/AuthContext";

const API_BASE = "https://bracu-research-server-eta.vercel.app";

export const UserContext = createContext(null);

/**
 * UserProvider — fetches only the current authenticated user's document
 * from the backend via /users/me?email=..., replacing the pattern of
 * fetching ALL users and scanning by email on the client.
 */
const UserProvider = ({ children }) => {
  const { user: firebaseUser, loading: authLoading } = useContext(AuthContext);
  const [dbUser, setDbUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    if (!firebaseUser?.email) {
      setDbUser(null);
      setUserLoading(false);
      return;
    }
    setUserLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/users/me?email=${encodeURIComponent(firebaseUser.email)}`
      );
      if (res.ok) {
        setDbUser(await res.json());
      } else {
        setDbUser(null);
      }
    } catch {
      setDbUser(null);
    } finally {
      setUserLoading(false);
    }
  }, [firebaseUser?.email]);

  useEffect(() => {
    if (!authLoading) fetchCurrentUser();
  }, [authLoading, fetchCurrentUser]);

  const value = {
    dbUser,
    loading: authLoading || userLoading,
    refetch: fetchCurrentUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
