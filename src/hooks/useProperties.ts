'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { notifications } from '@mantine/notifications';
import type { PropertyFormValues } from '@/lib/schemas/property';
import type { PropertyWithRelations, PropertyListItem, Property } from '@/types/property';
import { logActivity } from '@/lib/activity';

const supabase = createClient();

export interface PropertyFilters {
  status?: string;
  property_type?: string;
  city?: string;
  search?: string;
  agent_id?: string;
}

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          agent:profiles!properties_agent_id_fkey(id, full_name),
          photos:property_photos(id, url, is_cover)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status as Property['status']);
      if (filters?.property_type) query = query.eq('property_type', filters.property_type as Property['property_type']);
      if (filters?.city) query = query.ilike('city', `%${filters.city}%`);
      if (filters?.agent_id) query = query.eq('agent_id', filters.agent_id);
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as PropertyListItem[];
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          agent:profiles!properties_agent_id_fkey(id, full_name, phone),
          creator:profiles!properties_created_by_fkey(id, full_name),
          photos:property_photos(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as PropertyWithRelations;
    },
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (values: PropertyFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Не авторизовано');

      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...values,
          created_by: user.id,
          agent_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Property;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['activity'] });
      logActivity('create', 'property', data.id, data.title);
      notifications.show({
        title: 'Успіх',
        message: `Об'єкт "${data.title}" створено`,
        color: 'green',
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

export function useUpdateProperty(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<PropertyFormValues>) => {
      const { data: oldData } = await supabase
        .from('properties')
        .select('title, price, status')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('properties')
        .update(values)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const result = data as unknown as Property;
      const changes: Record<string, unknown> = {};
      if (oldData && values.price !== undefined && Number(oldData.price) !== values.price) {
        changes.price = { old: oldData.price, new: values.price };
      }
      if (oldData && values.status && oldData.status !== values.status) {
        changes.status = { old: oldData.status, new: values.status };
      }

      return { property: result, changes, oldTitle: oldData?.title };
    },
    onSuccess: ({ property, changes }) => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['property', id] });
      qc.invalidateQueries({ queryKey: ['activity'] });

      const action = changes.status ? 'status_change' : 'update';
      logActivity(action, 'property', id, property.title, Object.keys(changes).length > 0 ? changes : null);

      notifications.show({
        title: 'Збережено',
        message: 'Зміни збережено',
        color: 'green',
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

export function useDeleteProperty() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: prop } = await supabase
        .from('properties')
        .select('title')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, title: prop?.title ?? '' };
    },
    onSuccess: ({ id: propId, title }) => {
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['activity'] });
      logActivity('delete', 'property', propId, title);
      notifications.show({
        title: 'Видалено',
        message: "Об'єкт видалено",
        color: 'green',
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
