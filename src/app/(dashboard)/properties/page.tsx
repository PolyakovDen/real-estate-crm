'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  Container, Title, Group, Button, Stack, SegmentedControl,
  SimpleGrid, Paper, Box, Text, Kbd,
} from '@mantine/core';
import { useMediaQuery, useHotkeys } from '@mantine/hooks';
import { IconPlus, IconTable, IconLayoutGrid, IconList } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProperties, type PropertyFilters as FilterType } from '@/hooks/useProperties';
import { PropertyTable } from '@/components/properties/PropertyTable';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyListMobile } from '@/components/properties/PropertyListMobile';
import { StatsCards } from '@/components/properties/StatsCards';
import { EmptyState } from '@/components/ui/EmptyState';

function ShimmerBlock({ height }: { height: number }) {
  return <Box className="shimmer-skeleton" style={{ height, width: '100%' }} />;
}

function ListSkeleton() {
  return (
    <Stack gap={0}>
      {Array.from({ length: 8 }).map((_, i) => (
        <ShimmerBlock key={i} height={64} />
      ))}
    </Stack>
  );
}

function CardsSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {Array.from({ length: 6 }).map((_, i) => (
        <ShimmerBlock key={i} height={220} />
      ))}
    </SimpleGrid>
  );
}

function StatsSkeleton() {
  return <ShimmerBlock height={44} />;
}

export default function PropertiesPageWrapper() {
  return (
    <Suspense>
      <PropertiesPage />
    </Suspense>
  );
}

function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterType>(() => {
    const initial: FilterType = {};
    const status = searchParams.get('status');
    const agent = searchParams.get('agent');
    if (status) initial.status = status;
    if (agent) initial.agent_id = agent;
    return initial;
  });
  const isMobile = useMediaQuery('(max-width: 48em)');
  const [view, setView] = useState<string>('cards');
  const { data, isLoading } = useProperties(filters);

  useEffect(() => {
    if (isMobile !== undefined) {
      setView(isMobile ? 'list' : 'table');
    }
  }, [isMobile]);

  useHotkeys([
    ['n', () => router.push('/properties/new')],
    ['slash', () => {
      const el = document.querySelector<HTMLInputElement>('input[placeholder*="Пошук"]');
      el?.focus();
    }],
  ]);

  const viewOptions = isMobile
    ? [
        { value: 'list', label: <IconList size={14} /> },
        { value: 'cards', label: <IconLayoutGrid size={14} /> },
      ]
    : [
        { value: 'table', label: <IconTable size={16} /> },
        { value: 'cards', label: <IconLayoutGrid size={16} /> },
      ];

  return (
    <Container size="xl" py={isMobile ? 'xs' : 'md'} px={0}>
      <Stack gap={isMobile ? 'sm' : 'lg'}>
        <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
          <Group gap="xs" align="baseline" style={{ minWidth: 0 }}>
            <Title order={isMobile ? 3 : 2}>Об&#39;єкти</Title>
            {data && !isLoading && (
              <Text size="xs" c="dimmed">{data.length}</Text>
            )}
          </Group>
          <Group gap="xs" align="center" wrap="nowrap">
            {!isMobile && (
              <Text size="xs" c="dimmed">
                <Kbd size="xs">N</Kbd> новий
              </Text>
            )}
            <Button
              component={Link}
              href="/properties/new"
              leftSection={<IconPlus size={14} />}
              color="dark"
              size={isMobile ? 'xs' : 'sm'}
            >
              {isMobile ? 'Додати' : "Додати об'єкт"}
            </Button>
          </Group>
        </Group>

        {isLoading ? <StatsSkeleton /> : data && <StatsCards data={data} />}

        <Paper p={isMobile ? 'xs' : 'md'} withBorder radius={isMobile ? 0 : undefined} style={isMobile ? { marginLeft: -12, marginRight: -12, borderLeft: 'none', borderRight: 'none' } : undefined}>
          <Stack gap={isMobile ? 'xs' : 'md'}>
            <Group justify="space-between" wrap="nowrap" gap="xs">
              <PropertyFilters value={filters} onChange={setFilters} />
              <SegmentedControl
                value={view}
                onChange={setView}
                data={viewOptions}
                size="xs"
                style={{ flexShrink: 0 }}
              />
            </Group>

            {isLoading ? (
              (view === 'table' || view === 'list') ? <ListSkeleton /> : <CardsSkeleton />
            ) : !data || data.length === 0 ? (
              <EmptyState
                title="Поки що порожньо"
                description="Додайте перший об'єкт — квартиру, будинок чи комерцію"
                actionLabel="Додати об'єкт"
                actionHref="/properties/new"
              />
            ) : view === 'table' ? (
              <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <PropertyTable data={data} />
              </Box>
            ) : view === 'list' ? (
              <PropertyListMobile data={data} />
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={isMobile ? 'xs' : 'md'}>
                {data.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
