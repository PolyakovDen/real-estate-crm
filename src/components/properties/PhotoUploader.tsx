'use client';

import { useState, useCallback } from 'react';
import {
  Box, Text, Group, Stack, ActionIcon, SimpleGrid,
  Progress, Tooltip, Paper,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import {
  IconUpload, IconX, IconStar, IconStarFilled,
  IconPhoto, IconTrash,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { FileRejection } from '@mantine/dropzone';
import { useUploadPhoto, useDeletePhoto, useSetCoverPhoto } from '@/hooks/usePhotos';
import type { PropertyPhoto } from '@/types/property';

const MAX_PHOTOS = 15;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface PhotoUploaderProps {
  propertyId: string;
  photos: PropertyPhoto[];
}

export function PhotoUploader({ propertyId, photos }: PhotoUploaderProps) {
  const uploadMutation = useUploadPhoto(propertyId);
  const deleteMutation = useDeletePhoto(propertyId);
  const setCoverMutation = useSetCoverPhoto(propertyId);
  const [uploadQueue, setUploadQueue] = useState<{ name: string; progress: number }[]>([]);

  const sortedPhotos = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  const canUpload = photos.length + uploadQueue.length < MAX_PHOTOS;

  const handleReject = useCallback((rejections: FileRejection[]) => {
    for (const rejection of rejections) {
      const errors = rejection.errors.map((e) => {
        if (e.code === 'file-too-large') return `${rejection.file.name}: файл більше 5 МБ`;
        if (e.code === 'file-invalid-type') return `${rejection.file.name}: дозволені лише JPG, PNG, WebP`;
        return `${rejection.file.name}: ${e.message}`;
      });

      notifications.show({
        title: 'Файл відхилено',
        message: errors.join('; '),
        color: 'red',
      });
    }
  }, []);

  const handleDrop = useCallback(async (files: File[]) => {
    const remaining = MAX_PHOTOS - photos.length;

    if (files.length > remaining) {
      notifications.show({
        title: 'Забагато файлів',
        message: `Можна додати ще ${remaining} фото (максимум ${MAX_PHOTOS})`,
        color: 'yellow',
      });
    }

    const toUpload: File[] = [];
    for (const file of files.slice(0, remaining)) {
      if (file.size > MAX_FILE_SIZE) {
        notifications.show({
          title: 'Файл занадто великий',
          message: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} МБ) — максимум 5 МБ`,
          color: 'red',
        });
        continue;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        notifications.show({
          title: 'Невірний формат',
          message: `${file.name} — дозволені лише JPG, PNG, WebP`,
          color: 'red',
        });
        continue;
      }
      toUpload.push(file);
    }

    for (const file of toUpload) {
      const entry = { name: file.name, progress: 30 };
      setUploadQueue((q) => [...q, entry]);

      try {
        setUploadQueue((q) =>
          q.map((item) => item.name === file.name ? { ...item, progress: 60 } : item)
        );

        await uploadMutation.mutateAsync(file);

        setUploadQueue((q) =>
          q.map((item) => item.name === file.name ? { ...item, progress: 100 } : item)
        );
      } catch {
        // error notification handled by hook
      } finally {
        setTimeout(() => {
          setUploadQueue((q) => q.filter((item) => item.name !== file.name));
        }, 500);
      }
    }
  }, [photos.length, uploadMutation]);

  const handleDelete = (photo: PropertyPhoto) => {
    deleteMutation.mutate({
      photoId: photo.id,
      storagePath: photo.storage_path,
    });
  };

  const handleSetCover = (photoId: string) => {
    setCoverMutation.mutate(photoId);
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text size="sm" fw={500}>Фотографії</Text>
        <Text size="xs" c="dimmed">{photos.length} / {MAX_PHOTOS}</Text>
      </Group>

      {canUpload && (
        <Dropzone
          onDrop={handleDrop}
          onReject={handleReject}
          maxSize={MAX_FILE_SIZE}
          accept={IMAGE_MIME_TYPE}
          multiple
          disabled={!canUpload}
          py="md"
          style={{ borderStyle: 'dashed' }}
        >
          <Stack align="center" gap={4}>
            <Dropzone.Accept>
              <IconUpload size={24} color="var(--mantine-color-teal-6)" stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={24} color="var(--mantine-color-red-6)" stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto size={24} color="var(--mantine-color-dimmed)" stroke={1.5} />
            </Dropzone.Idle>
            <Text size="xs" c="dimmed">
              Перетягніть фото або натисніть для вибору
            </Text>
            <Text size="xs" c="dimmed">
              JPG, PNG, WebP до 5 МБ
            </Text>
          </Stack>
        </Dropzone>
      )}

      {uploadQueue.length > 0 && (
        <Stack gap="xs">
          {uploadQueue.map((item) => (
            <Paper key={item.name} p="xs" withBorder>
              <Group justify="space-between" mb={4}>
                <Text size="xs" truncate style={{ flex: 1 }}>{item.name}</Text>
                <Text size="xs" c="dimmed">{item.progress}%</Text>
              </Group>
              <Progress value={item.progress} size="xs" color="teal" animated />
            </Paper>
          ))}
        </Stack>
      )}

      {sortedPhotos.length > 0 && (
        <SimpleGrid cols={{ base: 3, sm: 4, md: 5 }} spacing="xs">
          {sortedPhotos.map((photo) => (
            <Box
              key={photo.id}
              style={{
                position: 'relative',
                aspectRatio: '4 / 3',
                borderRadius: 'var(--mantine-radius-sm)',
                overflow: 'hidden',
                border: photo.is_cover
                  ? '2px solid var(--mantine-color-teal-6)'
                  : '1px solid var(--mantine-color-default-border)',
              }}
            >
              <Box
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${photo.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {photo.is_cover && (
                <Box
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    backgroundColor: 'var(--mantine-color-teal-6)',
                    borderRadius: 4,
                    padding: '1px 6px',
                  }}
                >
                  <Text size="xs" c="white" style={{ fontSize: '0.6rem', lineHeight: 1.4 }}>
                    Обкладинка
                  </Text>
                </Box>
              )}

              <Group
                gap={2}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                }}
              >
                {!photo.is_cover && (
                  <Tooltip label="Зробити обкладинкою" openDelay={300}>
                    <ActionIcon
                      size="xs"
                      variant="filled"
                      color="dark"
                      radius="sm"
                      onClick={() => handleSetCover(photo.id)}
                      loading={setCoverMutation.isPending}
                      style={{ opacity: 0.8 }}
                    >
                      <IconStar size={10} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="Видалити" openDelay={300}>
                  <ActionIcon
                    size="xs"
                    variant="filled"
                    color="red"
                    radius="sm"
                    onClick={() => handleDelete(photo)}
                    loading={deleteMutation.isPending}
                    style={{ opacity: 0.8 }}
                  >
                    <IconTrash size={10} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
