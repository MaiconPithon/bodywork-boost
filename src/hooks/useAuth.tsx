import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContext {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext>({} as AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // Flag to avoid redundant role fetches when both getSession and onAuthStateChange fire for same user
  const rolesFetchedFor = useRef<string | null>(null);

  const checkRole = async (userId: string, force = false) => {
    if (!force && rolesFetchedFor.current === userId) return;
    rolesFetchedFor.current = userId;
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (data) {
        setIsAdmin(data.some((r) => r.role === "admin" || r.role === "super_admin"));
        setIsSuperAdmin(data.some((r) => r.role === "super_admin"));
      }
    } catch {
      // Network error – keep previous state
    }
  };

  useEffect(() => {
    // First hydrate from existing persisted session so we don't flash /login on F5
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRole(session.user.id);
      }
      setLoading(false);
    });

    // Then subscribe so any future auth events (login, logout, token refresh) are handled
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Force re-fetch on SIGNED_IN to ensure roles are loaded after login
          await checkRole(session.user.id, _event === "SIGNED_IN");
        } else {
          rolesFetchedFor.current = null;
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    rolesFetchedFor.current = null;
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  return (
    <AuthCtx.Provider value={{ user, session, isAdmin, isSuperAdmin, loading, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
