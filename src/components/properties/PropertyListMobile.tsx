'use client';

import { Text, Group, Box, UnstyledButton, Stack } from '@mantine/core';
import { IconPhoto, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { STATUS_LABELS, DEAL_TYPE_LABELS, STATUS_DOT_COLORS } from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/format';
import type { PropertyListItem } from '@/types/property';

function MobileThumb({ url }: { url?: string }) {
  if (url) {
    return (
      <Box
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0,
          border: '1px solid var(--mantine-color-default-border)',
        }}
      />
    );
  }

  return (
    <Box
      className="property-thumb-empty"
      style={{
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: 'var(--mantine-color-gray-1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <IconPhoto size={18} color="var(--mantine-color-gray-4)" stroke={1.5} />
    </Box>
  );
}

function PropertyRow({ property }: { property: PropertyListItem }) {
  const coverPhoto = property.photos?.find((p) => p.is_cover) ?? property.photos?.[0];

  const meta: string[] = [];
  if (property.total_area) meta.push(`${property.total_area} м²`);
  if (property.rooms) meta.push(`${property.rooms} кімн.`);

  return (
    <UnstyledButton
      component={Link}
      href={`/properties/${property.id}`}
      py={10}
      px={4}
      style={{
        borderBottom: '1px solid var(--mantine-color-default-border)',
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Group gap={10} wrap="nowrap" align="center">
        <MobileThumb url={coverPhoto?.url} />

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap" align="flex-start" gap={8}>
            <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
              {property.title}
            </Text>
            <Text fw={700} size="sm" style={{ flexShrink: 0 }}>
              {formatPrice(Number(property.price), property.currency)}
            </Text>
          </Group>

          <Group gap={4} mt={2} wrap="nowrap">
            <Text size="xs" c="dimmed" lineClamp={1}>
              {property.city}{property.district ? `, ${property.district}` : ''}
            </Text>
          </Group>

          <Group gap={6} mt={3} wrap="nowrap">
            <Box
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: STATUS_DOT_COLORS[property.status] ?? 'var(--mantine-color-gray-4)',
                flexShrink: 0,
              }}
            />
            <Text size="xs" c="dimmed" style={{ fontSize: '0.6875rem' }}>
              {STATUS_LABELS[property.status] ?? property.status}
            </Text>
            {meta.length > 0 && (
              <>
                <Text size="xs" c="dimmed" style={{ fontSize: '0.6875rem' }}>·</Text>
                <Text size="xs" c="dimmed" style={{ fontSize: '0.6875rem' }}>
                  {meta.join(' · ')}
                </Text>
              </>
            )}
            <Text size="xs" c="dimmed" style={{ fontSize: '0.6875rem' }}>·</Text>
            <Text size="xs" c="dimmed" style={{ fontSize: '0.6875rem' }}>
              {DEAL_TYPE_LABELS[property.deal_type] ?? property.deal_type}
            </Text>
          </Group>
        </Box>

        <IconChevronRight size={14} color="var(--mantine-color-gray-4)" stroke={1.5} style={{ flexShrink: 0 }} />
      </Group>
    </UnstyledButton>
  );
}

interface PropertyListMobileProps {
  data: PropertyListItem[];
}

export function PropertyListMobile({ data }: PropertyListMobileProps) {
  return (
    <Stack gap={0}>
      {data.map((property) => (
        <PropertyRow key={property.id} property={property} />
      ))}
    </Stack>
  );
}
