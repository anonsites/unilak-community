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
      event_interests_table: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_interests_table_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_table"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_interests_table_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_table"
            referencedColumns: ["id"]
          },
        ]
      }
      events_table: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          duration: string | null
          end_date: string | null
          flyer_url: string
          id: string
          interest_count: number
          published_at: string | null
          status: string
          start_date: string | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          duration?: string | null
          end_date?: string | null
          flyer_url: string
          id?: string
          interest_count?: number
          published_at?: string | null
          status?: string
          start_date?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          duration?: string | null
          end_date?: string | null
          flyer_url?: string
          id?: string
          interest_count?: number
          published_at?: string | null
          status?: string
          start_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_table_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_table"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_responses_table: {
        Row: {
          announcement_id: string | null
          content: string
          created_at: string | null
          id: string
          seen: boolean | null
          user_id: string | null
        }
        Insert: {
          announcement_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          seen?: boolean | null
          user_id?: string | null
        }
        Update: {
          announcement_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          seen?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_responses_table_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements_table"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_responses_table_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_table"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements_table: {
        Row: {
          created_at: string | null
          id: string
          message: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_table_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_table"
            referencedColumns: ["id"]
          },
        ]
      }
      classes_table: {
        Row: {
          cat_date: string | null
          classroom: string | null
          course_name: string
          cp_contact: string | null
          created_at: string | null
          department: string
          end_date: string | null
          exam_date: string | null
          faculty: string
          id: string
          intake: string
          lecturer: string | null
          program: string
          start_date: string | null
          updated_at: string | null
          whatsapp_link: string | null
          year_of_study: string
        }
        Insert: {
          cat_date?: string | null
          classroom?: string | null
          course_name: string
          cp_contact?: string | null
          created_at?: string | null
          department: string
          end_date?: string | null
          exam_date?: string | null
          faculty: string
          id?: string
          intake: string
          lecturer?: string | null
          program: string
          start_date?: string | null
          updated_at?: string | null
          whatsapp_link?: string | null
          year_of_study: string
        }
        Update: {
          cat_date?: string | null
          classroom?: string | null
          course_name?: string
          cp_contact?: string | null
          created_at?: string | null
          department?: string
          end_date?: string | null
          exam_date?: string | null
          faculty?: string
          id?: string
          intake?: string
          lecturer?: string | null
          program?: string
          start_date?: string | null
          updated_at?: string | null
          whatsapp_link?: string | null
          year_of_study?: string
        }
        Relationships: []
      }
      faq_table: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          keywords: string[] | null
          order: number | null
          question: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          answer: string
          category: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          keywords?: string[] | null
          order?: number | null
          question: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          keywords?: string[] | null
          order?: number | null
          question?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_faq_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_table"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_table: {
        Row: {
          created_at: string | null
          email: string
          feedback_type: string
          id: string
          message: string
          names: string
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          feedback_type: string
          id?: string
          message?: string
          names: string
          role: string
        }
        Update: {
          created_at?: string | null
          email?: string
          feedback_type?: string
          id?: string
          message?: string
          names?: string
          role?: string
        }
        Relationships: []
      }
      profiles_table: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          role: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          role: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
      survey_responses_table: {
        Row: {
          course_id: string | null
          course_name: string
          cp_contact: string
          created_at: string | null
          department: string
          id: string
          intake: string
          program: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          course_name: string
          cp_contact: string
          created_at?: string | null
          department: string
          id?: string
          intake: string
          program: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          course_name?: string
          cp_contact?: string
          created_at?: string | null
          department?: string
          id?: string
          intake?: string
          program?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "classes_table"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_id_survey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_table"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_classes: {
        Args: never
        Returns: {
          deleted_count: number
        }[]
      }
      delete_expired_classes: { Args: never; Returns: undefined }
      get_filtered_courses: {
        Args: {
          p_department: string
          p_faculty: string
          p_intake: string
          p_program: string
          p_year_of_study: string
        }
        Returns: {
          course_name: string
          department: string
          end_date: string
          faculty: string
          id: string
          intake: string
          lecturer: string
          program: string
          start_date: string
          year_of_study: string
        }[]
      }
      get_random_emoji: { Args: never; Returns: string }
      increment_faq_view_count: {
        Args: { p_faq_id: string }
        Returns: undefined
      }
      is_moderator: { Args: never; Returns: boolean }
      search_faqs: {
        Args: { p_search_query: string }
        Returns: {
          answer: string
          category: string
          id: string
          is_published: boolean
          question: string
          relevance: number
          view_count: number
        }[]
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
    Enums: {},
  },
} as const

