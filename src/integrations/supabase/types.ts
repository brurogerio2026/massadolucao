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
      banners: {
        Row: {
          button_label: string | null
          button_link: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          mobile_image_url: string | null
          sort_order: number
          subtitle: string | null
          title: string | null
        }
        Insert: {
          button_label?: string | null
          button_link?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          mobile_image_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          button_label?: string | null
          button_link?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          mobile_image_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      benefits: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          min_order_amount: number
          starts_at: string | null
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          min_order_amount?: number
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          min_order_amount?: number
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          cpf: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          total: number
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string | null
          complement: string | null
          coupon_code: string | null
          created_at: string
          customer_cpf: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount: number
          district: string | null
          id: string
          mp_payment_id: string | null
          mp_preference_id: string | null
          notes: string | null
          number: string | null
          order_number: number
          order_status: Database["public"]["Enums"]["order_status"]
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipping: number
          shipping_company_name: string | null
          shipping_delivery_days: number | null
          shipping_service_id: string | null
          shipping_service_name: string | null
          state: string | null
          street: string | null
          subtotal: number
          total: number
          tracking_code: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          complement?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_cpf?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          discount?: number
          district?: string | null
          id?: string
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          notes?: string | null
          number?: string | null
          order_number?: number
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping?: number
          shipping_company_name?: string | null
          shipping_delivery_days?: number | null
          shipping_service_id?: string | null
          shipping_service_name?: string | null
          state?: string | null
          street?: string | null
          subtotal?: number
          total?: number
          tracking_code?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          complement?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount?: number
          district?: string | null
          id?: string
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          notes?: string | null
          number?: string | null
          order_number?: number
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping?: number
          shipping_company_name?: string | null
          shipping_delivery_days?: number | null
          shipping_service_id?: string | null
          shipping_service_name?: string | null
          state?: string | null
          street?: string | null
          subtotal?: number
          total?: number
          tracking_code?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          order_id: string | null
          provider: string
          provider_payment_id: string | null
          raw: Json | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          order_id?: string | null
          provider?: string
          provider_payment_id?: string | null
          raw?: Json | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          order_id?: string | null
          provider?: string
          provider_payment_id?: string | null
          raw?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price: number
          product_id: string
          sale_price: number | null
          sku: string | null
          sort_order: number
          stock: number
          weight_grams: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price?: number
          product_id: string
          sale_price?: number | null
          sku?: string | null
          sort_order?: number
          stock?: number
          weight_grams?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          product_id?: string
          sale_price?: number | null
          sku?: string | null
          sort_order?: number
          stock?: number
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          benefits: Json
          category: string | null
          created_at: string
          description: string
          dimensions: string | null
          gallery: Json
          id: string
          image_url: string | null
          is_active: boolean
          min_quantity: number
          name: string
          package_height_cm: number
          package_length_cm: number
          package_width_cm: number
          price: number
          sale_price: number | null
          shipping_info: string
          short_description: string
          sku: string | null
          slug: string
          sort_order: number
          stock: number
          updated_at: string
          usage_info: string
          weight_grams: number | null
        }
        Insert: {
          benefits?: Json
          category?: string | null
          created_at?: string
          description?: string
          dimensions?: string | null
          gallery?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_quantity?: number
          name: string
          package_height_cm?: number
          package_length_cm?: number
          package_width_cm?: number
          price?: number
          sale_price?: number | null
          shipping_info?: string
          short_description?: string
          sku?: string | null
          slug: string
          sort_order?: number
          stock?: number
          updated_at?: string
          usage_info?: string
          weight_grams?: number | null
        }
        Update: {
          benefits?: Json
          category?: string | null
          created_at?: string
          description?: string
          dimensions?: string | null
          gallery?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_quantity?: number
          name?: string
          package_height_cm?: number
          package_length_cm?: number
          package_width_cm?: number
          price?: number
          sale_price?: number | null
          shipping_info?: string
          short_description?: string
          sku?: string | null
          slug?: string
          sort_order?: number
          stock?: number
          updated_at?: string
          usage_info?: string
          weight_grams?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          about_image_url: string | null
          about_text: string
          about_title: string
          address: string | null
          email: string | null
          favicon_url: string | null
          flat_shipping_rate: number
          free_shipping_enabled: boolean
          free_shipping_min: number | null
          id: string
          instagram: string | null
          logo_url: string | null
          privacy_policy: string
          shipping_origin_zip: string
          store_description: string
          store_name: string
          terms: string
          updated_at: string
          whatsapp: string | null
          whatsapp_message: string
        }
        Insert: {
          about_image_url?: string | null
          about_text?: string
          about_title?: string
          address?: string | null
          email?: string | null
          favicon_url?: string | null
          flat_shipping_rate?: number
          free_shipping_enabled?: boolean
          free_shipping_min?: number | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          privacy_policy?: string
          shipping_origin_zip?: string
          store_description?: string
          store_name?: string
          terms?: string
          updated_at?: string
          whatsapp?: string | null
          whatsapp_message?: string
        }
        Update: {
          about_image_url?: string | null
          about_text?: string
          about_title?: string
          address?: string | null
          email?: string | null
          favicon_url?: string | null
          flat_shipping_rate?: number
          free_shipping_enabled?: boolean
          free_shipping_min?: number | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          privacy_policy?: string
          shipping_origin_zip?: string
          store_description?: string
          store_name?: string
          terms?: string
          updated_at?: string
          whatsapp?: string | null
          whatsapp_message?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          location: string | null
          message: string
          name: string
          photo_url: string | null
          rating: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          message: string
          name: string
          photo_url?: string | null
          rating?: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          message?: string
          name?: string
          photo_url?: string | null
          rating?: number
          sort_order?: number
        }
        Relationships: []
      }
      usage_steps: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_approved_payment: {
        Args: {
          p_amount: number
          p_order_id: string
          p_payment_method: string
          p_provider_payment_id: string
          p_raw: Json
          p_status: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "awaiting_payment"
        | "paid"
        | "preparing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "refunded"
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
    Enums: {
      app_role: ["admin", "user"],
      order_status: [
        "awaiting_payment",
        "paid",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_status: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "refunded",
      ],
    },
  },
} as const
