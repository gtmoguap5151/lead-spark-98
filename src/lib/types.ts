export const SERVICE_TYPES = [
  "Roofing",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Windows & Doors",
  "Solar",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export const TIMELINES = [
  "ASAP (emergency)",
  "Within 30 days",
  "1-3 months",
  "3+ months / researching",
] as const;

export type Timeline = (typeof TIMELINES)[number];

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "appointment",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  appointment: "Appointment",
  won: "Won",
  lost: "Lost",
};

export type LeadNote = {
  id: string;
  body: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  zip: string;
  serviceType: ServiceType;
  projectDetails: string;
  timeline: Timeline;
  budget?: string;
  isHomeowner: boolean;
  isDecisionMaker: boolean;
  status: LeadStatus;
  contractorId: string | null;
  createdAt: string;
  appointmentAt?: string | null;
  jobValue?: number | null;
  notes: LeadNote[];
};

export type Contractor = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  password: string;
  phone: string;
  serviceTypes: ServiceType[];
  territoryZips: string[];
  city: string;
  active: boolean;
  createdAt: string;
};

export type Session =
  | { role: "contractor"; contractorId: string }
  | { role: "admin" }
  | null;

export type AppState = {
  contractors: Contractor[];
  leads: Lead[];
  session: Session;
};
