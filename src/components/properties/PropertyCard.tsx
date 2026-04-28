'use client';

import { Card, Text, Group, Stack, Box, Tooltip } from '@mantine/core';
import {
  IconPhoto, IconMapPin, IconHome, IconBuilding,
  IconBuildingStore, IconTrees, IconCar, IconDoor,
} from '@tabler/icons-react';
import Link from 'next/link';
import { STATUS_DOT_COLORS, STATUS_LABELS, DEAL_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/utils/constants';
import { formatPrice, formatArea } from '@/lib/utils/format';
import type { PropertyListItem } from '@/types/property';

const TYPE_ICONS: Record<string, typeof IconHome> = {
  apartment: IconBuilding,
  house: IconHome,
  commercial: IconBuildingStore,
  land: IconTrees,
  garage: IconCar,
  room: IconDoor,
};

export function PropertyCard({ property }: { property: PropertyListItem }) {
  const coverPhoto = property.photos?.find((p) => p.is_cover) ?? property.photos?.[0];
  const TypeIcon = TYPE_ICONS[property.property_type] ?? IconBuilding;

  return (
    <Card
      component={Link}
      href={`/properties/${property.id}`}
      withBorder
      padding={0}
      className="property-card"
      style={{
        textDecoration: 'none',
        color: 'inherit',
        borderLeft: `3px solid ${STATUS_DOT_COLORS[property.status] ?? 'var(--mantine-color-gray-3)'}`,
      }}
    >
      {coverPhoto?.url ? (
        <Card.Section>
          <Box
            style={{
              height: 140,
              backgroundImage: `url(${coverPhoto.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </Card.Section>
      ) : (
        <Card.Section>
          <Box
            className="property-card-placeholder"
            style={{
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconPhoto size={24} color="var(--mantine-color-gray-3)" stroke={1.5} />
          </Box>
        </Card.Section>
      )}

      <Stack gap={4} px="md" py="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={700} style={{ fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {formatPrice(Number(property.price), property.currency)}
          </Text>
          <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
            <Box
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: STATUS_DOT_COLORS[property.status] ?? 'var(--mantine-color-gray-4)',
                flexShrink: 0,
              }}
            />
            <Text size="xs" c="dimmed" style={{ fontSize: '0.6875rem' }}>
              {STATUS_LABELS[property.status] ?? property.status}
            </Text>
          </Group>
        </Group>

        <Text fw={500} size="sm" lineClamp={1} mt={2}>
          {property.title}
        </Text>

        <Group gap={4}>
          <IconMapPin size={12} color="var(--mantine-color-dimmed)" stroke={1.5} />
          <Text size="xs" c="dimmed" lineClamp={1}>
            {property.city}{property.district ? `, ${property.district}` : ''}
          </Text>
        </Group>

        <Group gap="xs" mt={2} align="center">
          <Tooltip label={PROPERTY_TYPE_LABELS[property.property_type] ?? property.property_type} openDelay={300}>
            <TypeIcon size={14} color="var(--mantine-color-dimmed)" stroke={1.5} />
          </Tooltip>
          <Text size="xs" c="dimmed">
            {DEAL_TYPE_LABELS[property.deal_type] ?? property.deal_type}
          </Text>
          {property.total_area && (
            <>
              <Text size="xs" c="dimmed">·</Text>
              <Text size="xs" c="dimmed">{formatArea(Number(property.total_area))}</Text>
            </>
          )}
        </Group>
      </Stack>
    </Card>
  );
}
