'use client';

import { Stack, Group, Text, Box, Avatar, Anchor, Loader, Center } from '@mantine/core';
import {
  IconPlus, IconEdit, IconTrash, IconPhoto,
  IconArrowsShuffle, IconUpload,
} from '@tabler/icons-react';
import Link from 'next/link';
import type { ActivityEntry } from '@/hooks/useActivity';

const ACTION_CONFIG: Record<string, { label: string; icon: typeof IconPlus; color: string }> = {
  create: { label: 'створив', icon: IconPlus, color: 'var(--mantine-color-teal-6)' },
  update: { label: 'оновив', icon: IconEdit, color: 'var(--mantine-color-blue-6)' },
  delete: { label: 'видалив', icon: IconTrash, color: 'var(--mantine-color-red-6)' },
  status_change: { label: 'змінив статус', icon: IconArrowsShuffle, color: 'var(--mantine-color-yellow-6)' },
  photo_upload: { label: 'додав фото', icon: IconUpload, color: 'var(--mantine-color-violet-6)' },
  photo_delete: { label: 'видалив фото', icon: IconPhoto, color: 'var(--mantine-color-red-4)' },
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'щойно';
  if (diffMin < 60) return `${diffMin} хв тому`;
  if (diffHrs < 24) return `${diffHrs} год тому`;
  if (diffDays === 1) return 'вчора';
  if (diffDays < 7) return `${diffDays} дн. тому`;

  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
  });
}

interface ActivityTimelineProps {
  data: ActivityEntry[];
  isLoading?: boolean;
  showEntityLink?: boolean;
}

export function ActivityTimeline({ data, isLoading, showEntityLink = true }: ActivityTimelineProps) {
  if (isLoading) {
    return <Center py="md"><Loader size="sm" color="teal" /></Center>;
  }

  if (!data || data.length === 0) {
    return <Text size="sm" c="dimmed" py="xs">Активності поки немає</Text>;
  }

  return (
    <Stack gap={0}>
      {data.map((entry) => {
        const config = ACTION_CONFIG[entry.action] ?? {
          label: entry.action,
          icon: IconEdit,
          color: 'var(--mantine-color-gray-5)',
        };
        const ActionIcon = config.icon;

        return (
          <Group
            key={entry.id}
            gap="sm"
            py="xs"
            wrap="nowrap"
            align="flex-start"
            style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
          >
            <Avatar
              size={28}
              radius="xl"
              src={entry.user?.avatar_url}
              color="teal"
              style={{ flexShrink: 0 }}
            >
              {entry.user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
            </Avatar>

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" lineClamp={2}>
                <Text span fw={500}>{entry.user?.full_name ?? 'Невідомий'}</Text>
                {' '}
                {config.label}
                {entry.entity_title && (
                  <>
                    {' '}
                    {showEntityLink && entry.entity_id ? (
                      <Anchor
                        component={Link}
                        href={`/properties/${entry.entity_id}`}
                        size="sm"
                        fw={500}
                        c="teal"
                      >
                        {entry.entity_title}
                      </Anchor>
                    ) : (
                      <Text span fw={500}>{entry.entity_title}</Text>
                    )}
                  </>
                )}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                {formatTimeAgo(entry.created_at)}
              </Text>
            </Box>

            <Box
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ActionIcon size={14} color={config.color} stroke={1.5} />
            </Box>
          </Group>
        );
      })}
    </Stack>
  );
}
