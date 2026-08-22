/**
 * Local demo persistence layer.
 *
 * Everything the app reads/writes goes through this store. When Supabase is
 * added, replace the internals of the action functions with async calls and
 * keep the same hook surface (useApp / useCurrentContractor).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { INITIAL_STATE } from "./demo-data";
import type { AppState, Contractor, Lead, LeadStatus, Session } from "./types";

const STORAGE_KEY = "cle_state_v1";

type NewLeadInput = Omit<Lead, "id" | "status" | "contractorId" | "createdAt" | "notes">;

type Store = {
  state: AppState;
  hydrated: boolean;
  signup: (
    input: Omit<Contractor, "id" | "createdAt" | "active">,
  ) => { ok: true; contractor: Contractor } | { ok: false; error: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginAsAdmin: () => void;
  loginDemo: () => void;
  logout: () => void;
  submitLead: (input: NewLeadInput) => Lead;
  updateLeadStatus: (id: string, status: LeadStatus, extra?: Partial<Lead>) => void;
  addNote: (id: string, body: string) => void;
  assignLead: (id: string, contractorId: string | null) => void;
  updateContractor: (id: string, patch: Partial<Contractor>) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<Store | null>(null);

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

/** Route a fresh lead to the first active contractor covering ZIP + service. */
function matchContractor(lead: Omit<Lead, "contractorId">, contractors: Contractor[]) {
  const match = contractors.find(
    (c) =>
      c.active &&
      c.serviceTypes.includes(lead.serviceType) &&
      c.territoryZips.includes(lead.zip),
  );
  return match?.id ?? null;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...INITIAL_STATE, ...(JSON.parse(raw) as AppState) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const setSession = useCallback((session: Session) => {
    setState((s) => ({ ...s, session }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      state,
      hydrated,
      signup: (input) => {
        const exists = state.contractors.some(
          (c) => c.email.toLowerCase() === input.email.toLowerCase(),
        );
        if (exists) return { ok: false, error: "An account with that email already exists." };
        const contractor: Contractor = {
          ...input,
          id: uid("c"),
          active: true,
          createdAt: new Date().toISOString(),
        };
        setState((s) => ({
          ...s,
          contractors: [...s.contractors, contractor],
          session: { role: "contractor", contractorId: contractor.id },
        }));
        return { ok: true, contractor };
      },
      login: (email, password) => {
        const found = state.contractors.find(
          (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password,
        );
        if (!found) return { ok: false, error: "Invalid email or password." };
        setSession({ role: "contractor", contractorId: found.id });
        return { ok: true };
      },
      loginAsAdmin: () => setSession({ role: "admin" }),
      loginDemo: () => setSession({ role: "contractor", contractorId: "c-1" }),
      logout: () => setSession(null),
      submitLead: (input) => {
        const base = {
          ...input,
          id: uid("l"),
          status: "new" as LeadStatus,
          createdAt: new Date().toISOString(),
          notes: [],
        };
        const lead: Lead = { ...base, contractorId: matchContractor(base, state.contractors) };
        setState((s) => ({ ...s, leads: [lead, ...s.leads] }));
        return lead;
      },
      updateLeadStatus: (id, status, extra) =>
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) => (l.id === id ? { ...l, ...extra, status } : l)),
        })),
      addNote: (id, body) =>
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  notes: [...l.notes, { id: uid("n"), body, createdAt: new Date().toISOString() }],
                }
              : l,
          ),
        })),
      assignLead: (id, contractorId) =>
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) => (l.id === id ? { ...l, contractorId } : l)),
        })),
      updateContractor: (id, patch) =>
        setState((s) => ({
          ...s,
          contractors: s.contractors.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      resetDemo: () => setState(INITIAL_STATE),
    }),
    [state, hydrated, setSession],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useApp() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useApp must be used inside StoreProvider");
  return ctx;
}

export function useCurrentContractor(): Contractor | null {
  const { state } = useApp();
  if (state.session?.role !== "contractor") return null;
  return state.contractors.find((c) => c.id === state.session!.contractorId) ?? null;
}

export function useContractorLeads(): Lead[] {
  const { state } = useApp();
  const contractor = useCurrentContractor();
  if (!contractor) return [];
  return state.leads
    .filter((l) => l.contractorId === contractor.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
