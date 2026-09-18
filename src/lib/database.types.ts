export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contractor_services: {
        Row: {
          contractor_id: string
          id: string
          service_type: string
        }
        Insert: {
          contractor_id: string
          id?: string
          service_type: string
        }
        Update: {
          contractor_id?: string
          id?: string
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_services_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_territories: {
        Row: {
          contractor_id: string
          id: string
          zip: string
        }
        Insert: {
          contractor_id: string
          id?: string
          zip: string
        }
        Update: {
          contractor_id?: string
          id?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_territories_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          active: boolean
          base_zip: string | null
          city: string | null
          company_name: string
          compliance_attested_at: string | null
          contact_name: string
          created_at: string
          email: string
          id: string
          license_number: string | null
          phone: string | null
          service_radius_miles: number | null
          terms_accepted_at: string | null
          terms_version: string | null
          territory_synced_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          base_zip?: string | null
          city?: string | null
          company_name: string
          compliance_attested_at?: string | null
          contact_name: string
          created_at?: string
          email: string
          id?: string
          license_number?: string | null
          phone?: string | null
          service_radius_miles?: number | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          territory_synced_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          base_zip?: string | null
          city?: string | null
          company_name?: string
          compliance_attested_at?: string | null
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          license_number?: string | null
          phone?: string | null
          service_radius_miles?: number | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          territory_synced_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_assignments: {
        Row: {
          assigned_at: string
          contractor_id: string
          id: string
          lead_id: string
        }
        Insert: {
          assigned_at?: string
          contractor_id: string
          id?: string
          lead_id: string
        }
        Update: {
          assigned_at?: string
          contractor_id?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignments_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          lead_id: string
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          lead_id: string
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          appointment_at: string | null
          attribution_campaign: string | null
          attribution_content: string | null
          attribution_medium: string | null
          attribution_source: string | null
          attribution_term: string | null
          budget: string | null
          consent_recorded_at: string | null
          consent_version: string | null
          contact_consent: boolean
          created_at: string
          email: string
          id: string
          initial_referrer_host: string | null
          is_adult: boolean
          is_decision_maker: boolean
          is_homeowner: boolean
          job_value: number | null
          marketing_consent: boolean
          name: string
          notes: Json
          phone: string
          project_details: string
          service_type: string
          status: string
          timeline: string | null
          updated_at: string
          zip: string
        }
        Insert: {
          appointment_at?: string | null
          attribution_campaign?: string | null
          attribution_content?: string | null
          attribution_medium?: string | null
          attribution_source?: string | null
          attribution_term?: string | null
          budget?: string | null
          consent_recorded_at?: string | null
          consent_version?: string | null
          contact_consent?: boolean
          created_at?: string
          email: string
          id?: string
          initial_referrer_host?: string | null
          is_adult?: boolean
          is_decision_maker?: boolean
          is_homeowner?: boolean
          job_value?: number | null
          marketing_consent?: boolean
          name: string
          notes?: Json
          phone: string
          project_details: string
          service_type: string
          status?: string
          timeline?: string | null
          updated_at?: string
          zip: string
        }
        Update: {
          appointment_at?: string | null
          attribution_campaign?: string | null
          attribution_content?: string | null
          attribution_medium?: string | null
          attribution_source?: string | null
          attribution_term?: string | null
          budget?: string | null
          consent_recorded_at?: string | null
          consent_version?: string | null
          contact_consent?: boolean
          created_at?: string
          email?: string
          id?: string
          initial_referrer_host?: string | null
          is_adult?: boolean
          is_decision_maker?: boolean
          is_homeowner?: boolean
          job_value?: number | null
          marketing_consent?: boolean
          name?: string
          notes?: Json
          phone?: string
          project_details?: string
          service_type?: string
          status?: string
          timeline?: string | null
          updated_at?: string
          zip?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          status: string
          stripe_invoice_id: string | null
          stripe_payment_id: string | null
          subscription_id: number | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
          subscription_id?: number | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_id?: string | null
          subscription_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_requests: {
        Row: {
          created_at: string
          decision_reason: string | null
          details: string | null
          due_at: string
          email: string
          id: string
          request_type: string
          resolved_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decision_reason?: string | null
          details?: string | null
          due_at?: string
          email: string
          id?: string
          request_type: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decision_reason?: string | null
          details?: string | null
          due_at?: string
          email?: string
          id?: string
          request_type?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      privacy_suppressions: {
        Row: {
          created_at: string
          email: string
          source_request_id: string | null
          suppression_type: string
        }
        Insert: {
          created_at?: string
          email: string
          source_request_id?: string | null
          suppression_type: string
        }
        Update: {
          created_at?: string
          email?: string
          source_request_id?: string | null
          suppression_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_suppressions_source_request_id_fkey"
            columns: ["source_request_id"]
            isOneToOne: false
            referencedRelation: "privacy_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          paid_at: string | null
          referral_id: string
          status: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_id: string
          status?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referred_contractor_id: string | null
          referred_email: string | null
          referrer_contractor_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referred_contractor_id?: string | null
          referred_email?: string | null
          referrer_contractor_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referred_contractor_id?: string | null
          referred_email?: string | null
          referrer_contractor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_contractor_id_fkey"
            columns: ["referred_contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_contractor_id_fkey"
            columns: ["referrer_contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_activities: {
        Row: {
          agent_role: string
          body: string | null
          channel: string
          created_at: string
          direction: string
          enrollment_id: string | null
          error_message: string | null
          id: string
          prospect_id: string
          provider_message_id: string | null
          scheduled_for: string
          sent_at: string | null
          sequence_step: number | null
          status: string
          subject: string | null
        }
        Insert: {
          agent_role: string
          body?: string | null
          channel: string
          created_at?: string
          direction?: string
          enrollment_id?: string | null
          error_message?: string | null
          id?: string
          prospect_id: string
          provider_message_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          sequence_step?: number | null
          status?: string
          subject?: string | null
        }
        Update: {
          agent_role?: string
          body?: string | null
          channel?: string
          created_at?: string
          direction?: string
          enrollment_id?: string | null
          error_message?: string | null
          id?: string
          prospect_id?: string
          provider_message_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          sequence_step?: number | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_activities_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "sales_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_activities_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "sales_prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_agent_events: {
        Row: {
          agent_role: string
          created_at: string
          decision: Json
          event_type: string
          id: string
          prospect_id: string | null
        }
        Insert: {
          agent_role: string
          created_at?: string
          decision?: Json
          event_type: string
          id?: string
          prospect_id?: string | null
        }
        Update: {
          agent_role?: string
          created_at?: string
          decision?: Json
          event_type?: string
          id?: string
          prospect_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_agent_events_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "sales_prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_enrollments: {
        Row: {
          completed_at: string | null
          current_step: number
          id: string
          last_error: string | null
          next_run_at: string
          prospect_id: string
          sequence_id: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number
          id?: string
          last_error?: string | null
          next_run_at?: string
          prospect_id: string
          sequence_id: string
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number
          id?: string
          last_error?: string | null
          next_run_at?: string
          prospect_id?: string
          sequence_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_enrollments_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "sales_prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sales_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_prospects: {
        Row: {
          city: string | null
          company_name: string
          contact_name: string | null
          converted_contractor_id: string | null
          created_at: string
          email: string | null
          id: string
          last_contacted_at: string | null
          metadata: Json
          next_action_at: string | null
          opted_out: boolean
          owner_agent: string
          phone: string | null
          score: number
          source: string
          stage: string
          state: string | null
          trade: string | null
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          city?: string | null
          company_name: string
          contact_name?: string | null
          converted_contractor_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          metadata?: Json
          next_action_at?: string | null
          opted_out?: boolean
          owner_agent?: string
          phone?: string | null
          score?: number
          source?: string
          stage?: string
          state?: string | null
          trade?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          city?: string | null
          company_name?: string
          contact_name?: string | null
          converted_contractor_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contacted_at?: string | null
          metadata?: Json
          next_action_at?: string | null
          opted_out?: boolean
          owner_agent?: string
          phone?: string | null
          score?: number
          source?: string
          stage?: string
          state?: string | null
          trade?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_prospects_converted_contractor_id_fkey"
            columns: ["converted_contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_sequence_steps: {
        Row: {
          agent_role: string
          channel: string
          created_at: string
          delay_minutes: number
          id: string
          objective: string
          sequence_id: string
          step_number: number
          stop_on_reply: boolean
          template_key: string | null
        }
        Insert: {
          agent_role: string
          channel: string
          created_at?: string
          delay_minutes?: number
          id?: string
          objective: string
          sequence_id: string
          step_number: number
          stop_on_reply?: boolean
          template_key?: string | null
        }
        Update: {
          agent_role?: string
          channel?: string
          created_at?: string
          delay_minutes?: number
          id?: string
          objective?: string
          sequence_id?: string
          step_number?: number
          stop_on_reply?: boolean
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sales_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_sequences: {
        Row: {
          active: boolean
          audience: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          audience?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          audience?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: number
          price_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: number
          price_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: number
          price_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_assign_lead: {
        Args: { p_contractor_id: string; p_lead_id: string }
        Returns: undefined
      }
      append_lead_note: {
        Args: { p_body: string; p_lead_id: string }
        Returns: {
          appointment_at: string | null
          attribution_campaign: string | null
          attribution_content: string | null
          attribution_medium: string | null
          attribution_source: string | null
          attribution_term: string | null
          budget: string | null
          consent_recorded_at: string | null
          consent_version: string | null
          contact_consent: boolean
          created_at: string
          email: string
          id: string
          initial_referrer_host: string | null
          is_adult: boolean
          is_decision_maker: boolean
          is_homeowner: boolean
          job_value: number | null
          marketing_consent: boolean
          name: string
          notes: Json
          phone: string
          project_details: string
          service_type: string
          status: string
          timeline: string | null
          updated_at: string
          zip: string
        }
        SetofOptions: {
          from: "*"
          to: "leads"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_contractor_radius_profile: {
        Args: {
          p_active: boolean
          p_base_zip: string
          p_city: string
          p_company_name: string
          p_contact_name: string
          p_phone: string
          p_service_radius_miles: number
          p_service_types: Json
          p_territory_zips: Json
          p_user_id: string
        }
        Returns: number
      }
      consume_public_intake_limit: {
        Args: {
          p_action: string
          p_max_requests: number
          p_request_hash: string
          p_window_seconds: number
        }
        Returns: boolean
      }
      get_sales_email_identity: { Args: never; Returns: Json }
      get_sales_orchestrator_secret: { Args: never; Returns: string }
      route_unassigned_leads: { Args: { p_limit?: number }; Returns: number }
      sync_contractor_radius_territory: {
        Args: {
          p_base_zip: string
          p_service_radius_miles: number
          p_territory_zips: Json
          p_user_id: string
        }
        Returns: number
      }
      update_contractor_profile: {
        Args: {
          p_active?: boolean
          p_city?: string
          p_company_name?: string
          p_contact_name?: string
          p_contractor_id: string
          p_phone?: string
          p_service_types?: Json
          p_territory_zips?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
