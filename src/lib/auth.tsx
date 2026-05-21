import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function applySession(sess: Session | null) {
      if (!mounted) return;

      setSession(sess);
      setUser(sess?.user ?? null);

      if (sess?.user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", sess.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (mounted) {
          setIsAdmin(!!data);
        }
      } else {
        setIsAdmin(false);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setLoading(true);
      setTimeout(() => {
        applySession(sess);
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
};
