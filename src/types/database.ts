export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: 'agent' | 'manager' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: 'agent' | 'manager' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          role?: 'agent' | 'manager' | 'admin';
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          created_by: string;
          agent_id: string;
          property_type: 'apartment' | 'house' | 'commercial' | 'land' | 'garage' | 'room';
          deal_type: 'sale' | 'rent_long' | 'rent_short' | 'rent_daily';
          status: 'draft' | 'active' | 'reserved' | 'sold' | 'rented' | 'archived' | 'withdrawn';
          listing_type: 'exclusive' | 'non_exclusive' | 'info';
          title: string;
          description: string | null;
          region: string | null;
          city: string;
          district: string | null;
          street: string | null;
          building_number: string | null;
          apartment_number: string | null;
          full_address: string | null;
          total_area: number | null;
          living_area: number | null;
          kitchen_area: number | null;
          rooms: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          floor: number | null;
          total_floors: number | null;
          price: number;
          currency: 'USD' | 'EUR' | 'UAH';
          price_per_sqm: number | null;
          condition: 'new_building' | 'after_repair' | 'designer' | 'lived' | 'needs_repair' | 'shell' | null;
          year_built: number | null;
          building_type: string | null;
          attributes: Record<string, unknown>;
          amenities: string[];
          owner_name: string | null;
          owner_phone: string | null;
          owner_notes: string | null;
          exclusive_until: string | null;
          commission_percent: number | null;
          commission_amount: number | null;
          external_listings: unknown[];
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          created_by: string;
          agent_id: string;
          property_type: 'apartment' | 'house' | 'commercial' | 'land' | 'garage' | 'room';
          deal_type: 'sale' | 'rent_long' | 'rent_short' | 'rent_daily';
          status?: 'draft' | 'active' | 'reserved' | 'sold' | 'rented' | 'archived' | 'withdrawn';
          listing_type?: 'exclusive' | 'non_exclusive' | 'info';
          title: string;
          description?: string | null;
          region?: string | null;
          city: string;
          district?: string | null;
          street?: string | null;
          building_number?: string | null;
          apartment_number?: string | null;
          full_address?: string | null;
          total_area?: number | null;
          living_area?: number | null;
          kitchen_area?: number | null;
          rooms?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          floor?: number | null;
          total_floors?: number | null;
          price: number;
          currency?: 'USD' | 'EUR' | 'UAH';
          condition?: 'new_building' | 'after_repair' | 'designer' | 'lived' | 'needs_repair' | 'shell' | null;
          year_built?: number | null;
          building_type?: string | null;
          attributes?: Record<string, unknown>;
          amenities?: string[];
          owner_name?: string | null;
          owner_phone?: string | null;
          owner_notes?: string | null;
          exclusive_until?: string | null;
          commission_percent?: number | null;
          commission_amount?: number | null;
          external_listings?: unknown[];
        };
        Update: {
          created_by?: string;
          agent_id?: string;
          property_type?: 'apartment' | 'house' | 'commercial' | 'land' | 'garage' | 'room';
          deal_type?: 'sale' | 'rent_long' | 'rent_short' | 'rent_daily';
          status?: 'draft' | 'active' | 'reserved' | 'sold' | 'rented' | 'archived' | 'withdrawn';
          listing_type?: 'exclusive' | 'non_exclusive' | 'info';
          title?: string;
          description?: string | null;
          region?: string | null;
          city?: string;
          district?: string | null;
          street?: string | null;
          building_number?: string | null;
          apartment_number?: string | null;
          full_address?: string | null;
          total_area?: number | null;
          living_area?: number | null;
          kitchen_area?: number | null;
          rooms?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          floor?: number | null;
          total_floors?: number | null;
          price?: number;
          currency?: 'USD' | 'EUR' | 'UAH';
          condition?: 'new_building' | 'after_repair' | 'designer' | 'lived' | 'needs_repair' | 'shell' | null;
          year_built?: number | null;
          building_type?: string | null;
          attributes?: Record<string, unknown>;
          amenities?: string[];
          owner_name?: string | null;
          owner_phone?: string | null;
          owner_notes?: string | null;
          exclusive_until?: string | null;
          commission_percent?: number | null;
          commission_amount?: number | null;
          external_listings?: unknown[];
        };
        Relationships: [
          {
            foreignKeyName: 'properties_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'properties_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      property_photos: {
        Row: {
          id: string;
          property_id: string;
          storage_path: string;
          url: string;
          is_cover: boolean;
          is_floor_plan: boolean;
          sort_order: number;
          width: number | null;
          height: number | null;
          size_bytes: number | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          storage_path: string;
          url: string;
          is_cover?: boolean;
          is_floor_plan?: boolean;
          sort_order?: number;
          width?: number | null;
          height?: number | null;
          size_bytes?: number | null;
          uploaded_by: string;
        };
        Update: {
          property_id?: string;
          storage_path?: string;
          url?: string;
          is_cover?: boolean;
          is_floor_plan?: boolean;
          sort_order?: number;
          width?: number | null;
          height?: number | null;
          size_bytes?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'property_photos_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'property_photos_uploaded_by_fkey';
            columns: ['uploaded_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      property_price_history: {
        Row: {
          id: string;
          property_id: string;
          old_price: number | null;
          new_price: number;
          currency: string;
          changed_by: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          old_price?: number | null;
          new_price: number;
          currency: string;
          changed_by: string;
          reason?: string | null;
        };
        Update: {
          old_price?: number | null;
          new_price?: number;
          currency?: string;
          changed_by?: string;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'property_price_history_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'property_price_history_changed_by_fkey';
            columns: ['changed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          entity_title: string | null;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          entity_title?: string | null;
          details?: Record<string, unknown> | null;
        };
        Update: {
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          entity_title?: string | null;
          details?: Record<string, unknown> | null;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      property_type: 'apartment' | 'house' | 'commercial' | 'land' | 'garage' | 'room';
      deal_type: 'sale' | 'rent_long' | 'rent_short' | 'rent_daily';
      property_status: 'draft' | 'active' | 'reserved' | 'sold' | 'rented' | 'archived' | 'withdrawn';
      listing_type: 'exclusive' | 'non_exclusive' | 'info';
      condition_type: 'new_building' | 'after_repair' | 'designer' | 'lived' | 'needs_repair' | 'shell';
    };
    CompositeTypes: Record<string, never>;
  };
}
