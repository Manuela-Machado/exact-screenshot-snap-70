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
          cor: string
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          cor?: string
          id: string
          nome: string
          ordem?: number
        }
        Update: {
          cor?: string
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
          is_demo: boolean
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
          is_demo?: boolean
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
          is_demo?: boolean
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
      totem_sessions: {
        Row: {
          id: string
          is_demo: boolean
          started_at: string
          totem_id: string
        }
        Insert: {
          id?: string
          is_demo?: boolean
          started_at?: string
          totem_id: string
        }
        Update: {
          id?: string
          is_demo?: boolean
          started_at?: string
          totem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "totem_sessions_totem_id_fkey"
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
          bairro: string | null
          endereco: string
          id: string
          is_demo: boolean
          last_seen_at: string | null
          lat: number
          lng: number
          nome: string
          parada: string | null
          status_manual: string
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          endereco: string
          id: string
          is_demo?: boolean
          last_seen_at?: string | null
          lat: number
          lng: number
          nome: string
          parada?: string | null
          status_manual?: string
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          endereco?: string
          id?: string
          is_demo?: boolean
          last_seen_at?: string | null
          lat?: number
          lng?: number
          nome?: string
          parada?: string | null
          status_manual?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dashboard_feedbacks_por_categoria: {
        Args: { p_fim: string; p_inicio: string }
        Returns: {
          categoria_id: string
          cor: string
          nome: string
          percentual: number
          total: number
        }[]
      }
      dashboard_kpis: {
        Args: { p_fim: string; p_inicio: string }
        Returns: {
          acessos_periodo: number
          acessos_periodo_anterior: number
          feedbacks_total: number
          nota_media: number
          totens_manutencao: number
          totens_offline: number
          totens_online: number
          variacao_pct: number
        }[]
      }
      dashboard_recomendacao: {
        Args: { p_fim: string; p_inicio: string }
        Returns: {
          categoria_id: string
          categoria_nome: string
          hora_inicio: number
          linha_codigo: string
          linha_nome: string
          total: number
        }[]
      }
      dashboard_totens_reclamacoes: {
        Args: { p_fim: string; p_inicio: string; p_limite?: number }
        Returns: {
          total: number
          totem_id: string
          totem_nome: string
        }[]
      }
      painel_totens: {
        Args: never
        Returns: {
          bairro: string
          id: string
          last_seen_at: string
          lat: number
          lng: number
          nome: string
          status: string
        }[]
      }
      totem_heartbeat: { Args: { p_totem_id: string }; Returns: undefined }
      ultimos_feedbacks: {
        Args: {
          p_fim: string
          p_inicio: string
          p_limite?: number
          p_offset?: number
        }
        Returns: {
          categoria_cor: string
          categoria_id: string
          categoria_nome: string
          created_at: string
          dia_semana: string
          linha_codigo: string
          linha_nome: string
          mensagem: string
          nota: number
          totem_bairro: string
          totem_nome: string
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
