'use client';

import { Stack, Group, Text, Box, Loader, Center } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight, IconMinus } from '@tabler/icons-react';
import { usePriceHistory } from '@/hooks/usePriceHistory';
import { formatPrice } from '@/lib/utils/format';

interface PriceHistoryProps {
  propertyId: string;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Сьогодні';
  if (diffDays === 1) return 'Вчора';
  if (diffDays < 7) return `${diffDays} дн. тому`;

  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function PriceHistory({ propertyId }: PriceHistoryProps) {
  const { data, isLoading } = usePriceHistory(propertyId);

  if (isLoading) {
    return <Center py="md"><Loader size="sm" color="teal" /></Center>;
  }

  if (!data || data.length === 0) {
    return (
      <Text size="sm" c="dimmed" py="xs">
        Змін ціни ще не було
      </Text>
    );
  }

  return (
    <Stack gap={0}>
      {data.map((entry) => {
        const isIncrease = entry.old_price !== null && entry.new_price > entry.old_price;
        const isDecrease = entry.old_price !== null && entry.new_price < entry.old_price;

        return (
          <Group
            key={entry.id}
            gap="sm"
            py="xs"
            wrap="nowrap"
            style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
          >
            <Box
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isIncrease
                  ? 'var(--mantine-color-red-0)'
                  : isDecrease
                  ? 'var(--mantine-color-green-0)'
                  : 'var(--mantine-color-gray-0)',
                flexShrink: 0,
              }}
            >
              {isIncrease ? (
                <IconArrowUpRight size={14} color="var(--mantine-color-red-6)" />
              ) : isDecrease ? (
                <IconArrowDownRight size={14} color="var(--mantine-color-green-6)" />
              ) : (
                <IconMinus size={14} color="var(--mantine-color-gray-5)" />
              )}
            </Box>

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" wrap="nowrap">
                {entry.old_price !== null && (
                  <>
                    <Text size="sm" c="dimmed" td="line-through">
                      {formatPrice(entry.old_price, entry.currency)}
                    </Text>
                    <Text size="xs" c="dimmed">&rarr;</Text>
                  </>
                )}
                <Text size="sm" fw={600}>
                  {formatPrice(entry.new_price, entry.currency)}
                </Text>
              </Group>
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  {formatRelativeDate(entry.created_at)}
                </Text>
                {entry.user && (
                  <Text size="xs" c="dimmed">
                    &middot; {entry.user.full_name}
                  </Text>
                )}
                {entry.reason && (
                  <Text size="xs" c="dimmed" fs="italic">
                    &middot; {entry.reason}
                  </Text>
                )}
              </Group>
            </Box>
          </Group>
        );
      })}
    </Stack>
  );
}
