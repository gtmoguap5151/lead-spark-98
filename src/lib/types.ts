export const SERVICE_TYPES = [
  "Roofing",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Remodeling",
  "Concrete",
  "Decks",
  "Painting",
  "Flooring",
  "Siding",
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

/** Plain-language project status shown to homeowners (no pipeline jargon). */
export const HOMEOWNER_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "In line for matching",
  contacted: "Contractor in touch",
  qualified: "Matched — details confirmed",
  appointment: "Visit scheduled",
  won: "Job booked",
  lost: "Closed",
};

/** Honest one-line explanation of each homeowner status. No timing promises. */
export const HOMEOWNER_STATUS_HELP: Record<LeadStatus, string> = {
  new: "Your project is in line. We hand-match every project to one verified local contractor — your request is never sold to a crowd.",
  contacted: "Your matched contractor has your project details and will contact you.",
  qualified: "Your matched contractor has confirmed the project details with you.",
  appointment: "A visit is scheduled with your matched contractor.",
  won: "This job was booked with your matched contractor.",
  lost: "This project was closed without a booking.",
};

export type LeadNote = {
  id: string;
  body: string;
  createdAt: string;
};

export type LeadAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrerHost?: string;
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
  isAdult: boolean;
  contactConsent: boolean;
  marketingConsent: boolean;
  consentVersion: string | null;
  consentRecordedAt: string | null;
  attribution: LeadAttribution;
  status: LeadStatus;
  contractorId: string | null;
  createdAt: string;
  appointmentAt?: string | null;
  jobValue?: number | null;
  notes: LeadNote[];
};

export type Contractor = {
  id: string;
  userId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceTypes: ServiceType[];
  territoryZips: string[];
  baseZip: string | null;
  serviceRadiusMiles: number | null;
  territorySyncedAt: string | null;
  city: string;
  active: boolean;
  licenseNumber: string;
  complianceAttestedAt: string | null;
  termsVersion: string | null;
  termsAcceptedAt: string | null;
  createdAt: string;
};

export type BillingSubscription = {
  status: string;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type AdminPayment = {
  id: string;
  userId: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
};

/** A subscription payment belonging to the signed-in contractor. */
export type ContractorPayment = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
};

export type AdminSubscription = {
  userId: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
};

export type AdminFinancials = {
  payments: AdminPayment[];
  subscriptions: AdminSubscription[];
};

export type PrivacyRequest = {
  id: string;
  email: string;
  requestType:
    | "access"
    | "correct"
    | "delete"
    | "portable_copy"
    | "marketing_opt_out"
    | "sale_opt_out"
    | "targeted_advertising_opt_out"
    | "profiling_opt_out"
    | "appeal"
    | "other";
  details: string | null;
  status: "pending" | "verifying" | "completed" | "denied";
  createdAt: string;
  updatedAt: string;
  dueAt: string;
  resolvedAt: string | null;
  decisionReason: string | null;
};

export type Session =
  | { role: "contractor"; contractorId: string }
  | { role: "admin" }
  | { role: "homeowner"; email: string }
  | null;

/** The signed-in user's own profile row (any role). */
export type MyProfile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  email: string;
  createdAt: string | null;
};

export type AppState = {
  contractors: Contractor[];
  leads: Lead[];
  session: Session;
  subscription: BillingSubscription | null;
  myPayments: ContractorPayment[];
  adminFinancials: AdminFinancials | null;
  privacyRequests: PrivacyRequest[];
  myProfile: MyProfile | null;
};
