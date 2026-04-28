'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { uploadPropertyPhoto, deletePropertyPhoto as deleteFromStorage } from '@/lib/supabase/storage';
import { notifications } from '@mantine/notifications';
import { logActivity } from '@/lib/activity';

const supabase = createClient();

export function useUploadPhoto(propertyId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Не авторизовано');

      const { data: existing } = await supabase
        .from('property_photos')
        .select('id')
        .eq('property_id', propertyId);

      const currentCount = existing?.length ?? 0;
      if (currentCount >= 15) {
        throw new Error('Максимум 15 фото на об\'єкт');
      }

      const result = await uploadPropertyPhoto(file, propertyId);

      const isFirstPhoto = currentCount === 0;

      const { data, error } = await supabase
        .from('property_photos')
        .insert({
          property_id: propertyId,
          storage_path: result.storagePath,
          url: result.url,
          is_cover: isFirstPhoto,
          is_floor_plan: false,
          sort_order: currentCount,
          width: result.width,
          height: result.height,
          size_bytes: result.sizeBytes,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) {
        await deleteFromStorage(result.storagePath).catch(() => {});
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['activity'] });
      logActivity('photo_upload', 'property', propertyId);
    },
    onError: (error) => {
      notifications.show({
        title: 'Помилка завантаження',
        message: error.message,
        color: 'red',
      });
    },
  });
}

export function useDeletePhoto(propertyId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, storagePath }: { photoId: string; storagePath: string }) => {
      const { error } = await supabase
        .from('property_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      await deleteFromStorage(storagePath).catch(() => {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['activity'] });
      logActivity('photo_delete', 'property', propertyId);
    },
    onError: (error) => {
      notifications.show({
        title: 'Помилка видалення',
        message: error.message,
        color: 'red',
      });
    },
  });
}

export function useSetCoverPhoto(propertyId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      await supabase
        .from('property_photos')
        .update({ is_cover: false })
        .eq('property_id', propertyId)
        .eq('is_cover', true);

      const { error } = await supabase
        .from('property_photos')
        .update({ is_cover: true })
        .eq('id', photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
      qc.invalidateQueries({ queryKey: ['properties'] });
      notifications.show({
        title: 'Обкладинку оновлено',
        message: 'Фото встановлено як обкладинку',
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

