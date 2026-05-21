import type { Tables } from "@/integrations/supabase/types";

export type StoreSession = Pick<
  Tables<"stores">,
  "id" | "store_id" | "store_name" | "owner_name" | "email" | "phone" | "address" | "status"
>;

const STORE_SESSION_KEY = "kongsi_store_session";

export function getStoreSession(): StoreSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORE_SESSION_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoreSession;
  } catch {
    clearStoreSession();
    return null;
  }
}

export function setStoreSession(store: StoreSession) {
  localStorage.setItem(STORE_SESSION_KEY, JSON.stringify(store));
}

export function clearStoreSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORE_SESSION_KEY);
}
