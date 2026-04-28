import { Stack, Skeleton, Group, Box } from '@mantine/core';

export default function DashboardLoading() {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Skeleton height={28} width={180} radius="sm" />
        <Skeleton height={36} width={130} radius="sm" />
      </Group>

      <Group gap="md" grow>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} p="md" style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 'var(--mantine-radius-md)' }}>
            <Skeleton height={14} width="60%" radius="sm" mb="xs" />
            <Skeleton height={28} width="80%" radius="sm" mb="xs" />
            <Skeleton height={12} width="40%" radius="sm" />
          </Box>
        ))}
      </Group>

      <Skeleton height={1} radius={0} />

      <Stack gap="xs">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={52} radius="sm" />
        ))}
      </Stack>
    </Stack>
  );
}
