'use client';

import {
  Container, Title, Stack, Paper, Group, Text, Box,
  SimpleGrid, Loader, Center, Anchor,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconBuilding, IconTag, IconCoin,
  IconTrendingUp,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useProperties } from '@/hooks/useProperties';
import { useActivityLog } from '@/hooks/useActivity';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { PROPERTY_TYPE_LABELS, STATUS_LABELS } from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/format';
import { SectionTitle } from '@/components/ui/SectionTitle';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
  href?: string;
}

function StatCard({ label, value, icon, accent, href }: StatCardProps) {
  const content = (
    <Paper p="md" withBorder style={href ? { cursor: 'pointer', transition: 'border-color 150ms ease' } : undefined}>
      <Group justify="space-between" wrap="nowrap">
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            {label}
          </Text>
          <Text fw={700} style={{ fontSize: '1.5rem', lineHeight: 1.2, letterSpacing: '-0.02em', color: accent }}>
            {value}
          </Text>
        </Box>
        <Box
          className="property-card-placeholder"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Group>
    </Paper>
  );

  if (href) {
    return (
      <Anchor component={Link} href={href} underline="never" style={{ color: 'inherit' }}>
        {content}
      </Anchor>
    );
  }
  return content;
}

function CityBar({ city, count, max }: { city: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <Group gap="sm" wrap="nowrap">
      <Text size="sm" w={120} truncate fw={500}>{city}</Text>
      <Box style={{ flex: 1, position: 'relative', height: 20 }}>
        <Box
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: 'var(--mantine-color-teal-6)',
            borderRadius: 'var(--mantine-radius-xs)',
            minWidth: 4,
            transition: 'width 300ms ease',
          }}
        />
      </Box>
      <Text size="sm" fw={600} w={30} ta="right">{count}</Text>
    </Group>
  );
}

export default function DashboardPage() {
  const { data: properties, isLoading: propsLoading } = useProperties();
  const { data: activity, isLoading: activityLoading } = useActivityLog(10);
  const isMobile = useMediaQuery('(max-width: 48em)');

  if (propsLoading) {
    return (
      <Container size="xl" py="md">
        <Center py="xl"><Loader color="teal" /></Center>
      </Container>
    );
  }

  const items = properties ?? [];
  const total = items.length;
  const active = items.filter((p) => p.status === 'active').length;
  const reserved = items.filter((p) => p.status === 'reserved').length;
  const sold = items.filter((p) => p.status === 'sold' || p.status === 'rented').length;

  const valueByCurrency = new Map<string, number>();
  items.forEach((p) => {
    const cur = p.currency ?? 'USD';
    valueByCurrency.set(cur, (valueByCurrency.get(cur) ?? 0) + Number(p.price));
  });
  const portfolioParts = Array.from(valueByCurrency.entries())
    .sort((a, b) => b[1] - a[1]);
  const portfolioLabel = portfolioParts
    .map(([cur, val]) => formatPrice(val, cur))
    .join(' + ');

  const avgByType = new Map<string, { sums: Map<string, number>; count: number }>();
  items.forEach((p) => {
    const entry = avgByType.get(p.property_type) ?? { sums: new Map(), count: 0 };
    const cur = p.currency ?? 'USD';
    entry.sums.set(cur, (entry.sums.get(cur) ?? 0) + Number(p.price));
    entry.count += 1;
    avgByType.set(p.property_type, entry);
  });

  const avgPriceData = Array.from(avgByType.entries())
    .map(([type, { sums, count }]) => {
      const mainCurrency = Array.from(sums.entries()).sort((a, b) => b[1] - a[1])[0];
      return {
        type,
        label: PROPERTY_TYPE_LABELS[type] ?? type,
        avg: Math.round((mainCurrency?.[1] ?? 0) / count),
        currency: mainCurrency?.[0] ?? 'USD',
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  const cityMap = new Map<string, number>();
  items.forEach((p) => {
    cityMap.set(p.city, (cityMap.get(p.city) ?? 0) + 1);
  });
  const topCities = Array.from(cityMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxCityCount = topCities[0]?.[1] ?? 1;

  const statusBreakdown = [
    { key: 'active', label: STATUS_LABELS['active'], count: active, color: 'var(--mantine-color-teal-6)' },
    { key: 'reserved', label: STATUS_LABELS['reserved'], count: reserved, color: 'var(--mantine-color-yellow-6)' },
    { key: 'sold', label: 'Продано / Здано', count: sold, color: 'var(--mantine-color-green-6)' },
  ];

  return (
    <Container size="xl" py={isMobile ? 'xs' : 'md'} px={0}>
      <Stack gap={isMobile ? 'sm' : 'lg'}>
        <Title order={isMobile ? 3 : 2}>Дашборд</Title>

        {/* Summary stats */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={isMobile ? 'xs' : 'md'}>
          <StatCard
            label="Всього"
            value={total}
            href="/properties"
            icon={<IconBuilding size={18} color="var(--mantine-color-dimmed)" stroke={1.5} />}
          />
          <StatCard
            label="Активних"
            value={active}
            accent="var(--mantine-color-teal-6)"
            href="/properties?status=active"
            icon={<IconTag size={18} color="var(--mantine-color-teal-6)" stroke={1.5} />}
          />
          <StatCard
            label="Портфель"
            value={portfolioLabel || '—'}
            icon={<IconCoin size={18} color="var(--mantine-color-yellow-6)" stroke={1.5} />}
          />
          <StatCard
            label="Закрито"
            value={sold}
            accent="var(--mantine-color-green-6)"
            href="/properties"
            icon={<IconTrendingUp size={18} color="var(--mantine-color-green-6)" stroke={1.5} />}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={isMobile ? 'sm' : 'md'}>
          {/* Status breakdown */}
          <Paper p={isMobile ? 'sm' : 'md'} withBorder>
            <SectionTitle>По статусах</SectionTitle>
            <Stack gap="sm">
              {statusBreakdown.map((s) => (
                <Group key={s.key} justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap">
                    <Box
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: s.color,
                        flexShrink: 0,
                      }}
                    />
                    <Text size="sm">{s.label}</Text>
                  </Group>
                  <Text size="sm" fw={600}>{s.count}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>

          {/* Average price by type */}
          <Paper p={isMobile ? 'sm' : 'md'} withBorder>
            <SectionTitle>Середня ціна за типом</SectionTitle>
            <Stack gap="sm">
              {avgPriceData.map((entry) => (
                <Group key={entry.type} justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap">
                    <Text size="sm">{entry.label}</Text>
                    <Text size="xs" c="dimmed">({entry.count})</Text>
                  </Group>
                  <Text size="sm" fw={600}>{formatPrice(entry.avg, entry.currency)}</Text>
                </Group>
              ))}
              {avgPriceData.length === 0 && (
                <Text size="sm" c="dimmed">Немає даних</Text>
              )}
            </Stack>
          </Paper>
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={isMobile ? 'sm' : 'md'}>
          {/* Top cities */}
          <Paper p={isMobile ? 'sm' : 'md'} withBorder>
            <SectionTitle>Топ міст</SectionTitle>
            <Stack gap="xs">
              {topCities.map(([city, count]) => (
                <CityBar key={city} city={city} count={count} max={maxCityCount} />
              ))}
              {topCities.length === 0 && (
                <Text size="sm" c="dimmed">Немає даних</Text>
              )}
            </Stack>
          </Paper>

          {/* Recent activity */}
          <Paper p={isMobile ? 'sm' : 'md'} withBorder>
            <SectionTitle>Остання активність</SectionTitle>
            <ActivityTimeline
              data={activity ?? []}
              isLoading={activityLoading}
            />
          </Paper>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
