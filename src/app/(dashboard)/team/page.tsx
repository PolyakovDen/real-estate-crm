'use client';

import {
  Container, Title, Stack, Paper, Group, Text, Avatar, Select,
  Box, Loader, Center, Badge, Anchor,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconBuilding } from '@tabler/icons-react';
import Link from 'next/link';
import { useTeam, useCurrentUserRole, useUpdateRole } from '@/hooks/useTeam';
import { formatDate } from '@/lib/utils/format';
import { ROLE_LABELS } from '@/lib/utils/constants';
import { EmptyState } from '@/components/ui/EmptyState';

const ROLE_COLORS: Record<string, string> = {
  agent: 'blue',
  manager: 'teal',
  admin: 'red',
};

const ROLE_OPTIONS = [
  { value: 'agent', label: 'Агент' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'admin', label: 'Адмін' },
];

export default function TeamPage() {
  const { data: team, isLoading } = useTeam();
  const { data: currentRole } = useCurrentUserRole();
  const updateRole = useUpdateRole();
  const isMobile = useMediaQuery('(max-width: 48em)');

  const canManageRoles = currentRole === 'manager' || currentRole === 'admin';

  if (isLoading) {
    return (
      <Container size="lg" py="md">
        <Center py="xl"><Loader color="teal" /></Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py={isMobile ? 'xs' : 'md'} px={0}>
      <Stack gap={isMobile ? 'sm' : 'lg'}>
        <Group justify="space-between" align="center">
          <Box>
            <Title order={isMobile ? 3 : 2}>Команда</Title>
            {team && <Text size="xs" c="dimmed">{team.length} учасників</Text>}
          </Box>
        </Group>

        {(!team || team.length === 0) ? (
          <EmptyState title="Немає учасників" description="Команда поки порожня" />
        ) : (
        <Stack gap="xs">
          {team.map((member) => {
            const initials = member.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <Paper key={member.id} p={isMobile ? 'sm' : 'md'} withBorder>
                <Group justify="space-between" wrap="nowrap" gap="sm">
                  <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Avatar size={isMobile ? 36 : 40} radius="xl" color="teal" variant="light" style={{ flexShrink: 0 }}>
                      {initials}
                    </Avatar>
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>{member.full_name}</Text>
                      <Group gap="xs" wrap="nowrap">
                        {member.phone && (
                          <Text size="xs" c="dimmed" truncate>{member.phone}</Text>
                        )}
                        <Text size="xs" c="dimmed">з {formatDate(member.created_at)}</Text>
                      </Group>
                      <Group gap="xs" mt={4}>
                        <Group gap={4} wrap="nowrap">
                          <IconBuilding size={12} color="var(--mantine-color-dimmed)" />
                          <Anchor
                            component={Link}
                            href={`/properties?agent=${member.id}`}
                            size="xs"
                            c="teal"
                          >
                            {member.property_count} об&apos;єктів
                          </Anchor>
                        </Group>
                      </Group>
                    </Box>
                  </Group>

                  <Box style={{ flexShrink: 0 }}>
                    {canManageRoles ? (
                      <Select
                        data={ROLE_OPTIONS}
                        value={member.role}
                        onChange={(value) => {
                          if (value && value !== member.role) {
                            updateRole.mutate({ userId: member.id, role: value as 'agent' | 'manager' | 'admin' });
                          }
                        }}
                        size="xs"
                        w={isMobile ? 110 : 130}
                        allowDeselect={false}
                        disabled={updateRole.isPending}
                      />
                    ) : (
                      <Badge
                        color={ROLE_COLORS[member.role] ?? 'gray'}
                        variant="light"
                        size="sm"
                      >
                        {ROLE_LABELS[member.role] ?? member.role}
                      </Badge>
                    )}
                  </Box>
                </Group>
              </Paper>
            );
          })}
        </Stack>
        )}
      </Stack>
    </Container>
  );
}
