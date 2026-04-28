'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface PriceHistoryEntry {
  id: string;
  property_id: string;
  old_price: number | null;
  new_price: number;
  currency: string;
  changed_by: string;
  reason: string | null;
  created_at: string;
  user: { full_name: string } | null;
}

export function usePriceHistory(propertyId: string) {
  return useQuery({
    queryKey: ['price-history', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_price_history')
        .select('*, user:profiles!property_price_history_changed_by_fkey(full_name)')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as PriceHistoryEntry[];
    },
    enabled: !!propertyId,
  });
}
