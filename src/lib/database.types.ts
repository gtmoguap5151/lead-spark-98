export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Relation<
  Name extends string,
  Columns extends string[],
  Referenced extends string,
  ReferencedColumns extends string[],
  One extends boolean = false,
> = {
  foreignKeyName: Name;
  columns: Columns;
  isOneToOne: One;
  referencedRelation: Referenced;
  referencedColumns: ReferencedColumns;
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contractors: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          contact_name: string;
          email: string;
          phone: string | null;
          city: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          contact_name: string;
          email: string;
          phone?: string | null;
          city?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          contact_name?: string;
          email?: string;
          phone?: string | null;
          city?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contractor_services: {
        Row: { id: string; contractor_id: string; service_type: string };
        Insert: { id?: string; contractor_id: string; service_type: string };
        Update: { id?: string; contractor_id?: string; service_type?: string };
        Relationships: [
          Relation<
            "contractor_services_contractor_id_fkey",
            ["contractor_id"],
            "contractors",
            ["id"]
          >,
        ];
      };
      contractor_territories: {
        Row: { id: string; contractor_id: string; zip: string };
        Insert: { id?: string; contractor_id: string; zip: string };
        Update: { id?: string; contractor_id?: string; zip?: string };
        Relationships: [
          Relation<
            "contractor_territories_contractor_id_fkey",
            ["contractor_id"],
            "contractors",
            ["id"]
          >,
        ];
      };
      leads: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string;
          zip: string;
          service_type: string;
          project_details: string;
          timeline: string | null;
          budget: string | null;
          is_homeowner: boolean;
          is_decision_maker: boolean;
          status: string;
          created_at: string;
          updated_at: string;
          appointment_at: string | null;
          job_value: number | null;
          notes: Json;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email: string;
          zip: string;
          service_type: string;
          project_details: string;
          timeline?: string | null;
          budget?: string | null;
          is_homeowner?: boolean;
          is_decision_maker?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
          appointment_at?: string | null;
          job_value?: number | null;
          notes?: Json;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string;
          zip?: string;
          service_type?: string;
          project_details?: string;
          timeline?: string | null;
          budget?: string | null;
          is_homeowner?: boolean;
          is_decision_maker?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
          appointment_at?: string | null;
          job_value?: number | null;
          notes?: Json;
        };
        Relationships: [];
      };
      lead_assignments: {
        Row: { id: string; lead_id: string; contractor_id: string; assigned_at: string };
        Insert: { id?: string; lead_id: string; contractor_id: string; assigned_at?: string };
        Update: { id?: string; lead_id?: string; contractor_id?: string; assigned_at?: string };
        Relationships: [
          Relation<"lead_assignments_lead_id_fkey", ["lead_id"], "leads", ["id"]>,
          Relation<"lead_assignments_contractor_id_fkey", ["contractor_id"], "contractors", ["id"]>,
        ];
      };
      lead_status_history: {
        Row: {
          id: string;
          lead_id: string;
          status: string;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          status: string;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          status?: string;
          changed_by?: string | null;
          created_at?: string;
        };
        Relationships: [Relation<"lead_status_history_lead_id_fkey", ["lead_id"], "leads", ["id"]>];
      };
      referrals: {
        Row: {
          id: string;
          referrer_contractor_id: string;
          referred_email: string | null;
          referred_contractor_id: string | null;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_contractor_id: string;
          referred_email?: string | null;
          referred_contractor_id?: string | null;
          code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_contractor_id?: string;
          referred_email?: string | null;
          referred_contractor_id?: string | null;
          code?: string;
          created_at?: string;
        };
        Relationships: [
          Relation<
            "referrals_referrer_contractor_id_fkey",
            ["referrer_contractor_id"],
            "contractors",
            ["id"]
          >,
          Relation<
            "referrals_referred_contractor_id_fkey",
            ["referred_contractor_id"],
            "contractors",
            ["id"]
          >,
        ];
      };
      referral_rewards: {
        Row: {
          id: string;
          referral_id: string;
          amount_cents: number;
          status: string;
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          referral_id: string;
          amount_cents: number;
          status?: string;
          created_at?: string;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          referral_id?: string;
          amount_cents?: number;
          status?: string;
          created_at?: string;
          paid_at?: string | null;
        };
        Relationships: [
          Relation<"referral_rewards_referral_id_fkey", ["referral_id"], "referrals", ["id"]>,
        ];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_id: string | null;
          amount_cents: number;
          currency: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_payment_id?: string | null;
          amount_cents: number;
          currency?: string;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_payment_id?: string | null;
          amount_cents?: number;
          currency?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      Subscriptions: {
        Row: {
          id: number;
          stripe_customer_id: string | null;
          user_id: string;
          stripe_subscription_id: string | null;
          Status: string | null;
          price_id: string | null;
          current_period_end: string | null;
        };
        Insert: {
          id?: number;
          stripe_customer_id?: string | null;
          user_id?: string;
          stripe_subscription_id?: string | null;
          Status?: string | null;
          price_id?: string | null;
          current_period_end?: string | null;
        };
        Update: {
          id?: number;
          stripe_customer_id?: string | null;
          user_id?: string;
          stripe_subscription_id?: string | null;
          Status?: string | null;
          price_id?: string | null;
          current_period_end?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      admin_assign_lead: {
        Args: { p_contractor_id: string | null; p_lead_id: string };
        Returns: undefined;
      };
      append_lead_note: {
        Args: { p_body: string; p_lead_id: string };
        Returns: Database["public"]["Tables"]["leads"]["Row"];
      };
      update_contractor_profile: {
        Args: {
          p_active?: boolean | null;
          p_city?: string | null;
          p_company_name?: string | null;
          p_contact_name?: string | null;
          p_contractor_id: string;
          p_phone?: string | null;
          p_service_types?: Json | null;
          p_territory_zips?: Json | null;
        };
        Returns: undefined;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
