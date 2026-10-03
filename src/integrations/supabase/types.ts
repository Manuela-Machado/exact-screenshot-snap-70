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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          chave: string
          valor: string
        }
        Insert: {
          chave: string
          valor: string
        }
        Update: {
          chave?: string
          valor?: string
        }
        Relationships: []
      }
      bus_lines: {
        Row: {
          ativo: boolean
          codigo: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          nome: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          nome?: string
        }
        Relationships: []
      }
      bus_schedules: {
        Row: {
          dia_tipo: string
          horario: string
          id: number
          linha_codigo: string
          plano_operacional: string
          sentido_origem: string
          variante_itinerario: string
          variante_num: number
        }
        Insert: {
          dia_tipo: string
          horario: string
          id?: never
          linha_codigo: string
          plano_operacional: string
          sentido_origem: string
          variante_itinerario: string
          variante_num: number
        }
        Update: {
          dia_tipo?: string
          horario?: string
          id?: never
          linha_codigo?: string
          plano_operacional?: string
          sentido_origem?: string
          variante_itinerario?: string
          variante_num?: number
        }
        Relationships: [
          {
            foreignKeyName: "bus_schedules_linha_codigo_fkey"
            columns: ["linha_codigo"]
            isOneToOne: false
            referencedRelation: "bus_lines"
            referencedColumns: ["codigo"]
          },
        ]
      }
      fare_groups: {
        Row: {
          id: number
          nome: string
          ordem: number
        }
        Insert: {
          id?: never
          nome: string
          ordem?: number
        }
        Update: {
          id?: never
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      fares: {
        Row: {
          descricao: string
          group_id: number
          id: number
          ordem: number
          valor: number
        }
        Insert: {
          descricao: string
          group_id: number
          id?: never
          ordem?: number
          valor: number
        }
        Update: {
          descricao?: string
          group_id?: number
          id?: never
          ordem?: number
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fares_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "fare_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_categories: {
        Row: {
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          id: string
          nome: string
          ordem?: number
        }
        Update: {
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      feedback_messages: {
        Row: {
          category_id: string
          id: number
          ordem: number
          texto: string
        }
        Insert: {
          category_id: string
          id?: never
          ordem?: number
          texto: string
        }
        Update: {
          category_id?: string
          id?: never
          ordem?: number
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_messages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "feedback_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          categoria_id: string
          created_at: string
          dia_semana: string | null
          horario: string | null
          id: string
          linha_codigo: string | null
          mensagem: string
          nota: number
          totem_id: string
        }
        Insert: {
          categoria_id: string
          created_at?: string
          dia_semana?: string | null
          horario?: string | null
          id?: string
          linha_codigo?: string | null
          mensagem: string
          nota: number
          totem_id?: string
        }
        Update: {
          categoria_id?: string
          created_at?: string
          dia_semana?: string | null
          horario?: string | null
          id?: string
          linha_codigo?: string | null
          mensagem?: string
          nota?: number
          totem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "feedback_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_linha_codigo_fkey"
            columns: ["linha_codigo"]
            isOneToOne: false
            referencedRelation: "bus_lines"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "feedbacks_totem_id_fkey"
            columns: ["totem_id"]
            isOneToOne: false
            referencedRelation: "totems"
            referencedColumns: ["id"]
          },
        ]
      }
      geocode_cache: {
        Row: {
          created_at: string
          display_name: string | null
          lat: number
          lng: number
          query: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          lat: number
          lng: number
          query: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          lat?: number
          lng?: number
          query?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          ativo: boolean
          created_at: string
          fonte: string | null
          id: number
          texto: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          fonte?: string | null
          id?: never
          texto: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          fonte?: string | null
          id?: never
          texto?: string
        }
        Relationships: []
      }
      route_cache: {
        Row: {
          cache_key: string
          created_at: string
          distance_m: number
          duration_s: number
          geometry: Json
        }
        Insert: {
          cache_key: string
          created_at?: string
          distance_m: number
          duration_s: number
          geometry: Json
        }
        Update: {
          cache_key?: string
          created_at?: string
          distance_m?: number
          duration_s?: number
          geometry?: Json
        }
        Relationships: []
      }
      search_logs: {
        Row: {
          created_at: string
          id: number
          linha_codigo: string | null
          resultados: number | null
          termo: string | null
          tipo: string
          totem_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          linha_codigo?: string | null
          resultados?: number | null
          termo?: string | null
          tipo: string
          totem_id?: string
        }
        Update: {
          created_at?: string
          id?: never
          linha_codigo?: string | null
          resultados?: number | null
          termo?: string | null
          tipo?: string
          totem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_logs_linha_codigo_fkey"
            columns: ["linha_codigo"]
            isOneToOne: false
            referencedRelation: "bus_lines"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "search_logs_totem_id_fkey"
            columns: ["totem_id"]
            isOneToOne: false
            referencedRelation: "totems"
            referencedColumns: ["id"]
          },
        ]
      }
      totems: {
        Row: {
          ativo: boolean
          endereco: string
          id: string
          lat: number
          lng: number
          nome: string
        }
        Insert: {
          ativo?: boolean
          endereco: string
          id: string
          lat: number
          lng: number
          nome: string
        }
        Update: {
          ativo?: boolean
          endereco?: string
          id?: string
          lat?: number
          lng?: number
          nome?: string
        }
        Relationships: []
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
