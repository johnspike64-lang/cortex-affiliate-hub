import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

async function syncAffiliateProfile(userId: string, email: string) {
  try {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleData?.role === "admin") {
      await supabase.from("afiliados").delete().eq("id", userId);
      return;
    }

    const { data: record, error: fetchErr } = await supabase
      .from("afiliados")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (fetchErr) {
      console.error("Error fetching affiliate by email:", fetchErr);
      return;
    }

    if (!record) {
      const { data: userData } = await supabase.auth.getUser();
      const nome = userData?.user?.user_metadata?.nome || userData?.user?.user_metadata?.full_name || email.split("@")[0];
      
      const { error: insertErr } = await supabase
        .from("afiliados")
        .insert({
          id: userId,
          user_id: userId,
          nome,
          email,
          status: "ativo",
        });
      if (insertErr) {
        console.error("Error inserting affiliate record:", insertErr);
      }
      return;
    }

    if (record && record.user_id !== userId) {
      console.log(`Linking affiliate: updating user_id for ${record.id} -> ${userId}`);
      const { error: updErr } = await supabase
        .from("afiliados")
        .update({ user_id: userId })
        .eq("id", record.id);
      
      if (updErr) {
        console.error("Error updating user_id for affiliate:", updErr);
      }
    }
  } catch (e) {
    console.error("Failed to sync affiliate profile:", e);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, next) => {
      setSession(next);
      if (next?.user) {
        syncAffiliateProfile(next.user.id, next.user.email ?? "");
        try {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", next.user.id)
            .maybeSingle();
          setRole(data?.role ?? "afiliado");
        } catch (e) {
          console.error("Error fetching user role:", e);
          setRole("afiliado");
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data }) => {
      const currentSession = data.session;
      setSession(currentSession);
      if (currentSession?.user) {
        syncAffiliateProfile(currentSession.user.id, currentSession.user.email ?? "");
        try {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentSession.user.id)
            .maybeSingle();
          setRole(roleData?.role ?? "afiliado");
        } catch (e) {
          console.error("Error fetching user role:", e);
          setRole("afiliado");
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      role,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
