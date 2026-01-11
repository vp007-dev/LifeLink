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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dispatch_broadcasts: {
        Row: {
          broadcast_at: string | null
          distance_km: number | null
          emergency_id: string
          eta_minutes: number | null
          id: string
          locked_at: string | null
          responded_at: string | null
          responder_id: string
          response_status: string | null
        }
        Insert: {
          broadcast_at?: string | null
          distance_km?: number | null
          emergency_id: string
          eta_minutes?: number | null
          id?: string
          locked_at?: string | null
          responded_at?: string | null
          responder_id: string
          response_status?: string | null
        }
        Update: {
          broadcast_at?: string | null
          distance_km?: number | null
          emergency_id?: string
          eta_minutes?: number | null
          id?: string
          locked_at?: string | null
          responded_at?: string | null
          responder_id?: string
          response_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_broadcasts_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_broadcasts_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      emergencies: {
        Row: {
          created_at: string | null
          description: string | null
          emergency_type: string
          id: string
          patient_lat: number
          patient_lng: number
          patient_name: string | null
          patient_phone: string | null
          priority: Database["public"]["Enums"]["emergency_priority"]
          sla_deadline: string | null
          status: Database["public"]["Enums"]["emergency_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          emergency_type: string
          id?: string
          patient_lat: number
          patient_lng: number
          patient_name?: string | null
          patient_phone?: string | null
          priority?: Database["public"]["Enums"]["emergency_priority"]
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["emergency_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          emergency_type?: string
          id?: string
          patient_lat?: number
          patient_lng?: number
          patient_name?: string | null
          patient_phone?: string | null
          priority?: Database["public"]["Enums"]["emergency_priority"]
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["emergency_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      emergency_assignments: {
        Row: {
          assigned_at: string | null
          completed_at: string | null
          current_distance_km: number | null
          emergency_id: string
          eta_minutes: number | null
          id: string
          responder_id: string
        }
        Insert: {
          assigned_at?: string | null
          completed_at?: string | null
          current_distance_km?: number | null
          emergency_id: string
          eta_minutes?: number | null
          id?: string
          responder_id: string
        }
        Update: {
          assigned_at?: string | null
          completed_at?: string | null
          current_distance_km?: number | null
          emergency_id?: string
          eta_minutes?: number | null
          id?: string
          responder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_assignments_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: true
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_assignments_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "responders"
            referencedColumns: ["id"]
          },
        ]
      }
      responders: {
        Row: {
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          id: string
          last_location_update: string | null
          name: string
          phone: string | null
          rating: number | null
          responder_type: string | null
          status: Database["public"]["Enums"]["responder_status"] | null
          total_rescues: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          last_location_update?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          responder_type?: string | null
          status?: Database["public"]["Enums"]["responder_status"] | null
          total_rescues?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          last_location_update?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          responder_type?: string | null
          status?: Database["public"]["Enums"]["responder_status"] | null
          total_rescues?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      sla_logs: {
        Row: {
          details: Json | null
          emergency_id: string
          event_at: string | null
          event_type: string
          id: string
        }
        Insert: {
          details?: Json | null
          emergency_id: string
          event_at?: string | null
          event_type: string
          id?: string
        }
        Update: {
          details?: Json | null
          emergency_id?: string
          event_at?: string | null
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_logs_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_sla_deadline: {
        Args: { p_priority: Database["public"]["Enums"]["emergency_priority"] }
        Returns: string
      }
      increment_responder_rescues: {
        Args: { p_responder_id: string }
        Returns: undefined
      }
    }
    Enums: {
      emergency_priority: "critical" | "high" | "medium" | "low"
      emergency_status:
        | "pending"
        | "dispatching"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "expired"
      responder_status: "available" | "busy" | "offline"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      emergency_priority: ["critical", "high", "medium", "low"],
      emergency_status: [
        "pending",
        "dispatching",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "expired",
      ],
      responder_status: ["available", "busy", "offline"],
    },
  },
} as const
