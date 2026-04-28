'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface ActivityEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_title: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  user: { full_name: string; avatar_url: string | null } | null;
}

export function useActivityLog(limit = 10) {
  return useQuery({
    queryKey: ['activity', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*, user:profiles!activity_log_user_id_fkey(full_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as unknown as ActivityEntry[];
    },
  });
}

export function usePropertyActivity(propertyId: string) {
  return useQuery({
    queryKey: ['activity', 'property', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*, user:profiles!activity_log_user_id_fkey(full_name, avatar_url)')
        .eq('entity_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as unknown as ActivityEntry[];
    },
    enabled: !!propertyId,
  });
}
