import { Group, Text, Box } from '@mantine/core';

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Group gap="sm" mb="sm">
      <Box style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: 'var(--mantine-color-teal-6)' }} />
      <Text fw={600} size="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: '0.04em' }}>
        {children}
      </Text>
    </Group>
  );
}
