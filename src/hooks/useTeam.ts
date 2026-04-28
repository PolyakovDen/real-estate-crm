'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { notifications } from '@mantine/notifications';
import { logActivity } from '@/lib/activity';

const supabase = createClient();

export interface TeamMember {
  id: string;
  full_name: string;
  phone: string | null;
  role: 'agent' | 'manager' | 'admin';
  avatar_url: string | null;
  created_at: string;
  property_count: number;
}

export function useTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { data: properties } = await supabase
        .from('properties')
        .select('agent_id');

      const countMap = new Map<string, number>();
      properties?.forEach((p) => {
        countMap.set(p.agent_id, (countMap.get(p.agent_id) ?? 0) + 1);
      });

      return (profiles ?? []).map((p) => ({
        ...p,
        property_count: countMap.get(p.id) ?? 0,
      })) as TeamMember[];
    },
  });
}

export function useCurrentUserRole() {
  return useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      return data?.role ?? null;
    },
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'agent' | 'manager' | 'admin' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
      return { userId, role };
    },
    onSuccess: ({ userId, role }) => {
      qc.invalidateQueries({ queryKey: ['team'] });
      qc.invalidateQueries({ queryKey: ['activity'] });
      logActivity('update', 'profile', userId, undefined, { field: 'role', new: role });
      notifications.show({
        title: 'Роль оновлено',
        message: `Роль змінено на ${role}`,
        color: 'teal',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Помилка',
        message: error.message,
        color: 'red',
      });
    },
  });
}
