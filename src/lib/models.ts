import type { Database, Json } from "./database.types";

type PublicTables = Database["public"]["Tables"];

export type ProfileRow = PublicTables["profiles"]["Row"];
export type ContractorRow = PublicTables["contractors"]["Row"];
export type ContractorServiceRow = PublicTables["contractor_services"]["Row"];
export type ContractorTerritoryRow = PublicTables["contractor_territories"]["Row"];
export type LeadRow = PublicTables["leads"]["Row"];
export type LeadInsert = PublicTables["leads"]["Insert"];
export type LeadUpdate = PublicTables["leads"]["Update"];
export type LeadAssignmentRow = PublicTables["lead_assignments"]["Row"];
export type LeadStatusHistoryRow = PublicTables["lead_status_history"]["Row"];
export type ReferralRow = PublicTables["referrals"]["Row"];
export type ReferralRewardRow = PublicTables["referral_rewards"]["Row"];
export type PaymentRow = PublicTables["payments"]["Row"];

export type ProfileRole = "contractor" | "admin";
export type ProductionLeadStatus =
  "new" | "contacted" | "qualified" | "appointment" | "won" | "lost";

export type LeadNoteRecord = {
  id: string;
  body: string;
  createdAt: string;
  authorId?: string;
};

export function isLeadNoteRecord(value: Json): value is LeadNoteRecord & Json {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof value.id === "string" &&
    typeof value.body === "string" &&
    typeof value.createdAt === "string"
  );
}

export function parseLeadNotes(notes: Json): LeadNoteRecord[] {
  return Array.isArray(notes) ? notes.filter(isLeadNoteRecord) : [];
}
