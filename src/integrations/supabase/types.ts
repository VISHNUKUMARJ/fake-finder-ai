export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audio_features: {
        Row: {
          audio_feature_id: number
          extracted_at: string | null
          feature_data: Json | null
          media_id: number | null
        }
        Insert: {
          audio_feature_id?: number
          extracted_at?: string | null
          feature_data?: Json | null
          media_id?: number | null
        }
        Update: {
          audio_feature_id?: number
          extracted_at?: string | null
          feature_data?: Json | null
          media_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_features_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["media_id"]
          },
        ]
      }
      combined_feature_store: {
        Row: {
          combined_at: string | null
          combined_features: Json | null
          combined_id: number
          media_id: number | null
        }
        Insert: {
          combined_at?: string | null
          combined_features?: Json | null
          combined_id?: number
          media_id?: number | null
        }
        Update: {
          combined_at?: string | null
          combined_features?: Json | null
          combined_id?: number
          media_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "combined_feature_store_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["media_id"]
          },
        ]
      }
      detection_results: {
        Row: {
          decision_at: string | null
          final_decision: string | null
          prediction_id: number | null
          result_id: number
        }
        Insert: {
          decision_at?: string | null
          final_decision?: string | null
          prediction_id?: number | null
          result_id?: number
        }
        Update: {
          decision_at?: string | null
          final_decision?: string | null
          prediction_id?: number | null
          result_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "detection_results_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["prediction_id"]
          },
        ]
      }
      media_files: {
        Row: {
          file_path: string | null
          media_id: number
          media_type: string | null
          status: string | null
          upload_date: string | null
          user_id: number | null
        }
        Insert: {
          file_path?: string | null
          media_id?: number
          media_type?: string | null
          status?: string | null
          upload_date?: string | null
          user_id?: number | null
        }
        Update: {
          file_path?: string | null
          media_id?: number
          media_type?: string | null
          status?: string | null
          upload_date?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      models: {
        Row: {
          description: string | null
          model_id: number
          model_name: string | null
          trained_at: string | null
          version: string | null
        }
        Insert: {
          description?: string | null
          model_id?: number
          model_name?: string | null
          trained_at?: string | null
          version?: string | null
        }
        Update: {
          description?: string | null
          model_id?: number
          model_name?: string | null
          trained_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          confidence_score: number | null
          media_id: number | null
          model_id: number | null
          predicted_at: string | null
          predicted_label: string | null
          prediction_id: number
        }
        Insert: {
          confidence_score?: number | null
          media_id?: number | null
          model_id?: number | null
          predicted_at?: string | null
          predicted_label?: string | null
          prediction_id?: number
        }
        Update: {
          confidence_score?: number | null
          media_id?: number | null
          model_id?: number | null
          predicted_at?: string | null
          predicted_label?: string | null
          prediction_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "predictions_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "predictions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["model_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          id: string
          is_admin: boolean | null
          name: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email: string
          id: string
          is_admin?: boolean | null
          name?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean | null
          name?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          confidence_score: number
          date: string
          filename: string | null
          id: string
          result: boolean
          text_snippet: string | null
          type: string
          user_id: string
        }
        Insert: {
          confidence_score: number
          date?: string
          filename?: string | null
          id?: string
          result: boolean
          text_snippet?: string | null
          type: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          date?: string
          filename?: string | null
          id?: string
          result?: boolean
          text_snippet?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      text_features: {
        Row: {
          extracted_at: string | null
          feature_data: Json | null
          media_id: number | null
          text_feature_id: number
        }
        Insert: {
          extracted_at?: string | null
          feature_data?: Json | null
          media_id?: number | null
          text_feature_id?: number
        }
        Update: {
          extracted_at?: string | null
          feature_data?: Json | null
          media_id?: number | null
          text_feature_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "text_features_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["media_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          name: string | null
          user_id: number
        }
        Insert: {
          created_at?: string | null
          email: string
          name?: string | null
          user_id?: number
        }
        Update: {
          created_at?: string | null
          email?: string
          name?: string | null
          user_id?: number
        }
        Relationships: []
      }
      video_features: {
        Row: {
          extracted_at: string | null
          feature_data: Json | null
          media_id: number | null
          video_feature_id: number
        }
        Insert: {
          extracted_at?: string | null
          feature_data?: Json | null
          media_id?: number | null
          video_feature_id?: number
        }
        Update: {
          extracted_at?: string | null
          feature_data?: Json | null
          media_id?: number | null
          video_feature_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_features_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["media_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
