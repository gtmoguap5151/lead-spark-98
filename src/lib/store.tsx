/* eslint-disable react-refresh/only-export-components */
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { parseLeadNotes } from "./models";
import { isSupabaseConfigured, supabase } from "./supabase";
import {
  SERVICE_TYPES,
  type AppState,
  type Contractor,
  type Lead,
  type LeadStatus,
  type ServiceType,
} from "./types";

type NewLeadInput = Omit<Lead, "id" | "status" | "contractorId" | "createdAt" | "notes">;
type SignupInput = Omit<Contractor, "id" | "createdAt" | "active"> & { password: string };
type ActionResult = { ok: true } | { ok: false; error: string };
type LoginResult = { ok: true; role: "contractor" | "admin" } | { ok: false; error: string };
type SignupResult = { ok: true; requiresEmailConfirmation: boolean } | { ok: false; error: string };

type Store = {
  state: AppState;
  hydrated: boolean;
  busy: boolean;
  error: string | null;
  signup: (input: SignupInput) => Promise<SignupResult>;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  submitLead: (input: NewLeadInput) => Promise<ActionResult>;
  updateLeadStatus: (
    id: string,
    status: LeadStatus,
    extra?: Partial<Lead>,
  ) => Promise<ActionResult>;
  addNote: (id: string, body: string) => Promise<ActionResult>;
  assignLead: (id: string, contractorId: string | null) => Promise<ActionResult>;
  updateContractor: (id: string, patch: Partial<Contractor>) => Promise<ActionResult>;
  refresh: () => Promise<void>;
};

const EMPTY_STATE: AppState = { contractors: [], leads: [], session: null };
const StoreContext = createContext<Store | null>(null);

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

const isServiceType = (value: string): value is ServiceType =>
  SERVICE_TYPES.includes(value as ServiceType);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadSequence = useRef(0);

  const loadData = useCallback(async (user: User) => {
    const sequence = ++loadSequence.current;
    setBusy(true);
    setError(null);

    const profileResult = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profileResult.error) throw profileResult.error;

    const role = profileResult.data?.role === "admin" ? "admin" : "contractor";
    const [contractorsResult, servicesResult, territoriesResult, leadsResult, assignmentsResult] =
      await Promise.all([
        supabase.from("contractors").select("*").order("created_at"),
        supabase.from("contractor_services").select("*"),
        supabase.from("contractor_territories").select("*"),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("lead_assignments").select("*"),
      ]);

    const firstError = [
      contractorsResult.error,
      servicesResult.error,
      territoriesResult.error,
      leadsResult.error,
      assignmentsResult.error,
    ].find(Boolean);
    if (firstError) throw firstError;

    const contractorRows = contractorsResult.data ?? [];
    const services = servicesResult.data ?? [];
    const territories = territoriesResult.data ?? [];
    const assignments = assignmentsResult.data ?? [];
    const contractors: Contractor[] = contractorRows.map((row) => ({
      id: row.id,
      companyName: row.company_name,
      contactName: row.contact_name,
      email: row.email,
      phone: row.phone ?? "",
      city: row.city ?? "",
      active: row.active,
      createdAt: row.created_at,
      serviceTypes: services
        .filter((item) => item.contractor_id === row.id)
        .map((item) => item.service_type)
        .filter(isServiceType),
      territoryZips: territories
        .filter((item) => item.contractor_id === row.id)
        .map((item) => item.zip),
    }));

    const leads: Lead[] = (leadsResult.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      zip: row.zip,
      serviceType: isServiceType(row.service_type) ? row.service_type : "Roofing",
      projectDetails: row.project_details,
      timeline: (row.timeline ?? "3+ months / researching") as Lead["timeline"],
      budget: row.budget ?? undefined,
      isHomeowner: row.is_homeowner,
      isDecisionMaker: row.is_decision_maker,
      status: row.status as LeadStatus,
      contractorId:
        assignments.find((assignment) => assignment.lead_id === row.id)?.contractor_id ?? null,
      createdAt: row.created_at,
      appointmentAt: row.appointment_at,
      jobValue: row.job_value,
      notes: parseLeadNotes(row.notes),
    }));

    const ownRow = contractorRows.find((row) => row.user_id === user.id);
    if (sequence !== loadSequence.current) return role;
    setState({
      contractors,
      leads,
      session:
        role === "admin"
          ? { role: "admin" }
          : ownRow
            ? { role: "contractor", contractorId: ownRow.id }
            : null,
    });
    return role;
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured for this deployment.");
      return;
    }
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (data.user) await loadData(data.user);
  }, [loadData]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      if (!isSupabaseConfigured) {
        setError("Supabase is not configured for this deployment.");
        setHydrated(true);
        return;
      }
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError && userError.name !== "AuthSessionMissingError") throw userError;
        if (data.user) await loadData(data.user);
      } catch (loadError) {
        if (active) setError(errorMessage(loadError));
      } finally {
        if (active) {
          setBusy(false);
          setHydrated(true);
        }
      }
    }

    void initialize();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.user) {
        loadSequence.current += 1;
        setState(EMPTY_STATE);
        return;
      }
      window.setTimeout(() => {
        void loadData(session.user)
          .catch((loadError) => setError(errorMessage(loadError)))
          .finally(() => setBusy(false));
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadData]);

  const run = useCallback(async (operation: () => Promise<void>): Promise<ActionResult> => {
    if (!isSupabaseConfigured) return { ok: false, error: "Supabase is not configured." };
    setBusy(true);
    setError(null);
    try {
      await operation();
      return { ok: true };
    } catch (operationError) {
      const detail = errorMessage(operationError);
      setError(detail);
      return { ok: false, error: detail };
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo<Store>(
    () => ({
      state,
      hydrated,
      busy,
      error,
      signup: async (input) => {
        if (!isSupabaseConfigured) return { ok: false, error: "Supabase is not configured." };
        setBusy(true);
        setError(null);
        try {
          const { data, error: signupError } = await supabase.auth.signUp({
            email: input.email.trim(),
            password: input.password,
            options: {
              data: {
                full_name: input.contactName,
                company_name: input.companyName,
                contact_name: input.contactName,
                phone: input.phone,
                city: input.city,
                service_types: input.serviceTypes,
                territory_zips: input.territoryZips,
              },
            },
          });
          if (signupError) throw signupError;
          if (data.session && data.user) await loadData(data.user);
          return { ok: true, requiresEmailConfirmation: !data.session };
        } catch (signupError) {
          const detail = errorMessage(signupError);
          setError(detail);
          return { ok: false, error: detail };
        } finally {
          setBusy(false);
        }
      },
      login: async (email, password) => {
        if (!isSupabaseConfigured) return { ok: false, error: "Supabase is not configured." };
        setBusy(true);
        setError(null);
        try {
          const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (loginError) throw loginError;
          const role = await loadData(data.user);
          return { ok: true, role };
        } catch (loginError) {
          const detail = errorMessage(loginError);
          setError(detail);
          return { ok: false, error: detail };
        } finally {
          setBusy(false);
        }
      },
      logout: async () => {
        await supabase.auth.signOut();
        loadSequence.current += 1;
        setState(EMPTY_STATE);
      },
      submitLead: (input) =>
        run(async () => {
          const { error: insertError } = await supabase.from("leads").insert({
            name: input.name,
            phone: input.phone,
            email: input.email,
            zip: input.zip,
            service_type: input.serviceType,
            project_details: input.projectDetails,
            timeline: input.timeline,
            budget: input.budget ?? null,
            is_homeowner: input.isHomeowner,
            is_decision_maker: input.isDecisionMaker,
          });
          if (insertError) throw insertError;
        }),
      updateLeadStatus: (id, status, extra) =>
        run(async () => {
          const update = {
            status,
            updated_at: new Date().toISOString(),
            ...(extra?.appointmentAt !== undefined ? { appointment_at: extra.appointmentAt } : {}),
            ...(extra?.jobValue !== undefined ? { job_value: extra.jobValue } : {}),
          };
          const { error: updateError } = await supabase.from("leads").update(update).eq("id", id);
          if (updateError) throw updateError;
          await refresh();
        }),
      addNote: (id, body) =>
        run(async () => {
          const { error: noteError } = await supabase.rpc("append_lead_note", {
            p_lead_id: id,
            p_body: body,
          });
          if (noteError) throw noteError;
          await refresh();
        }),
      assignLead: (id, contractorId) =>
        run(async () => {
          const { error: assignmentError } = await supabase.rpc("admin_assign_lead", {
            p_lead_id: id,
            p_contractor_id: contractorId,
          });
          if (assignmentError) throw assignmentError;
          await refresh();
        }),
      updateContractor: (id, patch) =>
        run(async () => {
          const { error: profileError } = await supabase.rpc("update_contractor_profile", {
            p_contractor_id: id,
            p_company_name: patch.companyName,
            p_contact_name: patch.contactName,
            p_phone: patch.phone,
            p_city: patch.city,
            p_active: patch.active,
            p_service_types: patch.serviceTypes,
            p_territory_zips: patch.territoryZips,
          });
          if (profileError) throw profileError;
          await refresh();
        }),
      refresh,
    }),
    [state, hydrated, busy, error, loadData, refresh, run],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useApp() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useApp must be used inside StoreProvider");
  return context;
}

export function useCurrentContractor(): Contractor | null {
  const { state } = useApp();
  if (state.session?.role !== "contractor") return null;
  return (
    state.contractors.find((contractor) => contractor.id === state.session?.contractorId) ?? null
  );
}

export function useContractorLeads(): Lead[] {
  const { state } = useApp();
  const contractor = useCurrentContractor();
  if (!contractor) return [];
  return state.leads
    .filter((lead) => lead.contractorId === contractor.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
