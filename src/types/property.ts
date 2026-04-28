import type { Database } from './database';

export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type PropertyPhoto = Database['public']['Tables']['property_photos']['Row'];
export type PropertyPriceHistory = Database['public']['Tables']['property_price_history']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];

export type PropertyType = Database['public']['Enums']['property_type'];
export type DealType = Database['public']['Enums']['deal_type'];
export type PropertyStatus = Database['public']['Enums']['property_status'];
export type ListingType = Database['public']['Enums']['listing_type'];
export type ConditionType = Database['public']['Enums']['condition_type'];

export interface PropertyWithRelations extends Property {
  agent: Pick<Profile, 'id' | 'full_name' | 'phone'> | null;
  creator: Pick<Profile, 'id' | 'full_name'> | null;
  photos: PropertyPhoto[];
}

export interface PropertyListItem extends Property {
  agent: Pick<Profile, 'id' | 'full_name'> | null;
  photos: Pick<PropertyPhoto, 'id' | 'url' | 'is_cover'>[];
}
