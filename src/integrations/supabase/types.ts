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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          content_fr: string | null
          content_pl: string | null
          created_at: string
          excerpt: string | null
          excerpt_fr: string | null
          excerpt_pl: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          published: boolean | null
          slug: string
          title: string
          title_fr: string | null
          title_pl: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          content_fr?: string | null
          content_pl?: string | null
          created_at?: string
          excerpt?: string | null
          excerpt_fr?: string | null
          excerpt_pl?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug: string
          title: string
          title_fr?: string | null
          title_pl?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          content_fr?: string | null
          content_pl?: string | null
          created_at?: string
          excerpt?: string | null
          excerpt_fr?: string | null
          excerpt_pl?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          slug?: string
          title?: string
          title_fr?: string | null
          title_pl?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          newsletter_optin: boolean | null
          read: boolean | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          newsletter_optin?: boolean | null
          read?: boolean | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          newsletter_optin?: boolean | null
          read?: boolean | null
          subject?: string
        }
        Relationships: []
      }
      faq_categories: {
        Row: {
          active: boolean | null
          created_at: string
          icon: string
          id: string
          sort_order: number | null
          title: string
          title_fr: string | null
          title_pl: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          icon?: string
          id?: string
          sort_order?: number | null
          title: string
          title_fr?: string | null
          title_pl?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          icon?: string
          id?: string
          sort_order?: number | null
          title?: string
          title_fr?: string | null
          title_pl?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          active: boolean | null
          answer: string
          answer_fr: string | null
          answer_pl: string | null
          category_id: string
          created_at: string
          id: string
          question: string
          question_fr: string | null
          question_pl: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          answer: string
          answer_fr?: string | null
          answer_pl?: string | null
          category_id: string
          created_at?: string
          id?: string
          question: string
          question_fr?: string | null
          question_pl?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          answer?: string
          answer_fr?: string | null
          answer_pl?: string | null
          category_id?: string
          created_at?: string
          id?: string
          question?: string
          question_fr?: string | null
          question_pl?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      footer_links: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          label: string
          label_fr: string | null
          label_pl: string | null
          sort_order: number | null
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          label: string
          label_fr?: string | null
          label_pl?: string | null
          sort_order?: number | null
          updated_at?: string
          url?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          label?: string
          label_fr?: string | null
          label_pl?: string | null
          sort_order?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      life_stages: {
        Row: {
          active: boolean | null
          created_at: string
          description: string
          description_fr: string | null
          description_pl: string | null
          icon: string
          id: string
          image_url: string | null
          sort_order: number | null
          title: string
          title_fr: string | null
          title_pl: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description: string
          description_fr?: string | null
          description_pl?: string | null
          icon?: string
          id?: string
          image_url?: string | null
          sort_order?: number | null
          title: string
          title_fr?: string | null
          title_pl?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string
          description_fr?: string | null
          description_pl?: string | null
          icon?: string
          id?: string
          image_url?: string | null
          sort_order?: number | null
          title?: string
          title_fr?: string | null
          title_pl?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mass_schedules: {
        Row: {
          active: boolean | null
          created_at: string
          day_of_week: string
          day_of_week_fr: string | null
          day_of_week_pl: string | null
          description: string | null
          description_fr: string | null
          description_pl: string | null
          id: string
          is_special: boolean | null
          language: string | null
          location: string | null
          location_fr: string | null
          location_pl: string | null
          sort_order: number | null
          special_date: string | null
          time: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          day_of_week: string
          day_of_week_fr?: string | null
          day_of_week_pl?: string | null
          description?: string | null
          description_fr?: string | null
          description_pl?: string | null
          id?: string
          is_special?: boolean | null
          language?: string | null
          location?: string | null
          location_fr?: string | null
          location_pl?: string | null
          sort_order?: number | null
          special_date?: string | null
          time: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          day_of_week?: string
          day_of_week_fr?: string | null
          day_of_week_pl?: string | null
          description?: string | null
          description_fr?: string | null
          description_pl?: string | null
          id?: string
          is_special?: boolean | null
          language?: string | null
          location?: string | null
          location_fr?: string | null
          location_pl?: string | null
          sort_order?: number | null
          special_date?: string | null
          time?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          active: boolean | null
          consent_date: string
          email: string
          id: string
        }
        Insert: {
          active?: boolean | null
          consent_date?: string
          email: string
          id?: string
        }
        Update: {
          active?: boolean | null
          consent_date?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          content_fr: string | null
          content_pl: string | null
          created_at: string
          id: string
          meta_description: string | null
          meta_description_fr: string | null
          meta_description_pl: string | null
          meta_title: string | null
          meta_title_fr: string | null
          meta_title_pl: string | null
          published: boolean | null
          slug: string
          title: string
          title_fr: string | null
          title_pl: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          content_fr?: string | null
          content_pl?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_description_fr?: string | null
          meta_description_pl?: string | null
          meta_title?: string | null
          meta_title_fr?: string | null
          meta_title_pl?: string | null
          published?: boolean | null
          slug: string
          title: string
          title_fr?: string | null
          title_pl?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          content_fr?: string | null
          content_pl?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_description_fr?: string | null
          meta_description_pl?: string | null
          meta_title?: string | null
          meta_title_fr?: string | null
          meta_title_pl?: string | null
          published?: boolean | null
          slug?: string
          title?: string
          title_fr?: string | null
          title_pl?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          active: boolean | null
          bio: string | null
          bio_fr: string | null
          bio_pl: string | null
          category: string
          community: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          name_fr: string | null
          name_pl: string | null
          phone: string | null
          photo_url: string | null
          role: string
          role_fr: string | null
          role_pl: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          bio?: string | null
          bio_fr?: string | null
          bio_pl?: string | null
          category: string
          community?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          name_fr?: string | null
          name_pl?: string | null
          phone?: string | null
          photo_url?: string | null
          role: string
          role_fr?: string | null
          role_pl?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          bio?: string | null
          bio_fr?: string | null
          bio_pl?: string | null
          category?: string
          community?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          name_fr?: string | null
          name_pl?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string
          role_fr?: string | null
          role_pl?: string | null
          sort_order?: number | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_team_members_public: {
        Args: never
        Returns: {
          active: boolean
          bio: string
          bio_fr: string
          bio_pl: string
          category: string
          community: string
          created_at: string
          id: string
          name: string
          name_fr: string
          name_pl: string
          photo_url: string
          role: string
          role_fr: string
          role_pl: string
          sort_order: number
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_editor: { Args: { _user_id: string }; Returns: boolean }
      is_default_docs_password: { Args: never; Returns: boolean }
      update_docs_password: { Args: { new_password: string }; Returns: boolean }
      verify_docs_password: {
        Args: { input_password: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
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
      app_role: ["admin", "editor"],
    },
  },
} as const
