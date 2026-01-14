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
      attendance: {
        Row: {
          checked_at: string | null
          created_at: string
          event_id: string
          id: string
          is_present: boolean
          member_id: string
          notes: string | null
          server_id_at_check: number | null
          server_name_at_check: string | null
          tmp_id: number
        }
        Insert: {
          checked_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          is_present?: boolean
          member_id: string
          notes?: string | null
          server_id_at_check?: number | null
          server_name_at_check?: string | null
          tmp_id: number
        }
        Update: {
          checked_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          is_present?: boolean
          member_id?: string
          notes?: string | null
          server_id_at_check?: number | null
          server_name_at_check?: string | null
          tmp_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
     event_booking_settings: {
        Row: {
          booking_enabled: boolean
          created_at: string
          id: string
          truckersmp_event_id: string
          updated_at: string
        }
        Insert: {
          booking_enabled?: boolean
          created_at?: string
          id?: string
          truckersmp_event_id: string
          updated_at?: string
        }
        Update: {
          booking_enabled?: boolean
          created_at?: string
          id?: string
          truckersmp_event_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_slots: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_locked: boolean
          locked_for: string | null
          slot_image_url: string | null
          slot_label: string | null
          slot_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_locked?: boolean
          locked_for?: string | null
          slot_image_url?: string | null
          slot_label?: string | null
          slot_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_locked?: boolean
          locked_for?: string | null
          slot_image_url?: string | null
          slot_label?: string | null
          slot_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          attendance_checked_at: string | null
          banner_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          destination: string | null
          end_time: string | null
          id: string
          meetup_location: string | null
          slot_booking_enabled: boolean
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          target_server_id: number | null
          target_server_name: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attendance_checked_at?: string | null
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          destination?: string | null
          end_time?: string | null
          id?: string
          meetup_location?: string | null
          slot_booking_enabled?: boolean
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          target_server_id?: number | null
          target_server_name?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attendance_checked_at?: string | null
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          destination?: string | null
          end_time?: string | null
          id?: string
          meetup_location?: string | null
          slot_booking_enabled?: boolean
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          target_server_id?: number | null
          target_server_name?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number | null
          id: string
          instagram_url: string | null
          is_featured: boolean | null
          media_url: string
          thumbnail_url: string | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          instagram_url?: string | null
          is_featured?: boolean | null
          media_url: string
          thumbnail_url?: string | null
          title?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          instagram_url?: string | null
          is_featured?: boolean | null
          media_url?: string
          thumbnail_url?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_active: boolean
          join_date: string | null
          last_seen_online: string | null
          last_seen_server: string | null
          tmp_id: number
          total_convoys: number
          total_distance_km: number
          updated_at: string
          username: string
          vtc_role: Database["public"]["Enums"]["vtc_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          join_date?: string | null
          last_seen_online?: string | null
          last_seen_server?: string | null
          tmp_id: number
          total_convoys?: number
          total_distance_km?: number
          updated_at?: string
          username: string
          vtc_role?: Database["public"]["Enums"]["vtc_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          join_date?: string | null
          last_seen_online?: string | null
          last_seen_server?: string | null
          tmp_id?: number
          total_convoys?: number
          total_distance_km?: number
          updated_at?: string
          username?: string
          vtc_role?: Database["public"]["Enums"]["vtc_role"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          tmp_id: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          tmp_id?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          tmp_id?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      slot_bookings: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          created_at: string
          discord_id: string
          discord_message_id: string | null
          event_id: string
          id: string
          member_count: number
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          slot_id: string | null
          slot_number: number
          status: string
          updated_at: string
          vtc_name: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          discord_id: string
          discord_message_id?: string | null
          event_id: string
          id?: string
          member_count: number
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slot_id?: string | null
          slot_number: number
          status?: string
          updated_at?: string
          vtc_name: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          discord_id?: string
          discord_message_id?: string | null
          event_id?: string
          id?: string
          member_count?: number
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slot_id?: string | null
          slot_number?: number
          status?: string
          updated_at?: string
          vtc_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "slot_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "event_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string
          data: Json | null
          event_id: string | null
          id: string
          level: string
          member_id: string | null
          message: string
          run_id: string | null
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          event_id?: string | null
          id?: string
          level?: string
          member_id?: string | null
          message: string
          run_id?: string | null
          source: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          event_id?: string | null
          id?: string
          level?: string
          member_id?: string | null
          message?: string
          run_id?: string | null
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
                  }
        Relationships: []
      }
      vtc_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      event_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      vtc_role:
        | "Founder"
        | "Manager"
        | "Management"
        | "Human Resources"
        | "HR"
        | "Member"
        | "Driver"
        | "Trainee"
        | "Trial"
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
      app_role: ["admin", "moderator", "user"],
      event_status: ["scheduled", "in_progress", "completed", "cancelled"],
      vtc_role: [
        "Founder",
        "Manager",
        "Management",
        "Human Resources",
        "HR",
        "Member",
        "Driver",
        "Trainee",
        "Trial",
      ],
    },
  },
} as const
