'use client';

import { Group, Text, Paper, Box, SimpleGrid } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface StatsCardsProps {
  data: { status: string }[];
}

export function StatsCards({ data }: StatsCardsProps) {
  const total = data.length;
  const active = data.filter((d) => d.status === 'active').length;
  const reserved = data.filter((d) => d.status === 'reserved').length;
  const sold = data.filter((d) => d.status === 'sold' || d.status === 'rented').length;
  const isMobile = useMediaQuery('(max-width: 48em)');

  const stats = [
    { label: 'Всього', value: total, color: 'var(--mantine-color-dimmed)' },
    { label: 'Активних', value: active, color: 'var(--mantine-color-teal-6)' },
    { label: 'Резерв', value: reserved, color: 'var(--mantine-color-yellow-6)' },
    { label: 'Закрито', value: sold, color: 'var(--mantine-color-green-6)' },
  ];

  if (isMobile) {
    return (
      <SimpleGrid cols={4} spacing={0}>
        {stats.map((stat) => (
          <Box key={stat.label} py={8} style={{ textAlign: 'center' }}>
            <Text fw={700} style={{ fontSize: '1.125rem', lineHeight: 1.1, color: stat.color }}>
              {stat.value}
            </Text>
            <Text size="xs" c="dimmed" mt={2} style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {stat.label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <Paper px="lg" py="sm" withBorder>
      <Group gap="xl" wrap="wrap">
        {stats.map((stat, i) => (
          <Group key={stat.label} gap="xs" align="center" wrap="nowrap">
            {i > 0 && (
              <Box
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: stat.color,
                  flexShrink: 0,
                }}
              />
            )}
            <Text size="sm" c="dimmed">{stat.label}</Text>
            <Text size="sm" fw={700}>{stat.value}</Text>
          </Group>
        ))}
      </Group>
    </Paper>
  );
}
