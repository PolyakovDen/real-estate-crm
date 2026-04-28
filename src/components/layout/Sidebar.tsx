'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  NavLink, Stack, Divider, Group, Text, Button, Box,
  Avatar, Badge, UnstyledButton,
} from '@mantine/core';
import {
  IconBuilding, IconPlus, IconLogout, IconHome2,
  IconChartBar, IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ROLE_LABELS } from '@/lib/utils/constants';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const { data: user } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity,
  });

  const { data: profile } = useQuery({
    queryKey: ['auth-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  const { data: propertyCount } = useQuery({
    queryKey: ['properties-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
  });

  const handleLogout = async () => {
    onNavigate?.();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const userName = user?.user_metadata?.full_name ?? user?.email ?? '...';
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    {
      label: "Об'єкти",
      href: '/properties',
      icon: IconBuilding,
      badge: propertyCount && propertyCount > 0 ? propertyCount : undefined,
      active: pathname === '/properties' || (pathname.startsWith('/properties/') && !pathname.endsWith('/new')),
    },
    {
      label: "Додати об'єкт",
      href: '/properties/new',
      icon: IconPlus,
      active: pathname === '/properties/new',
    },
  ];

  return (
    <Stack justify="space-between" h="100%" p={0}>
      {/* Teal top accent line */}
      <Box style={{ height: 2, backgroundColor: 'var(--mantine-color-teal-6)' }} />

      <Box style={{ flex: 1 }}>
        <Group gap="xs" px="md" py="md" mb={4}>
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: 'var(--mantine-color-teal-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconHome2 size={16} color="white" />
          </Box>
          <Text size="sm" fw={700} c="white">RE CRM</Text>
        </Group>

        <Stack gap={2} px="xs">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={<item.icon size={16} stroke={1.5} />}
              rightSection={
                item.badge ? (
                  <Text size="xs" c="dark.2" fw={500}>{item.badge}</Text>
                ) : undefined
              }
              active={item.active}
              color="teal"
              variant="light"
              onClick={() => onNavigate?.()}
              style={{
                borderRadius: 'var(--mantine-radius-sm)',
                color: item.active ? 'var(--mantine-color-teal-4)' : 'var(--mantine-color-dark-1)',
                fontWeight: item.active ? 500 : 400,
                fontSize: '0.875rem',
              }}
            />
          ))}
        </Stack>

        <Divider color="dark.5" my="xs" />

        <Stack gap={2} px="xs">
          <NavLink
            component={Link}
            href="/dashboard"
            label="Дашборд"
            leftSection={<IconChartBar size={16} stroke={1.5} />}
            active={pathname === '/dashboard'}
            color="teal"
            variant="light"
            onClick={() => onNavigate?.()}
            style={{
              borderRadius: 'var(--mantine-radius-sm)',
              color: pathname === '/dashboard' ? 'var(--mantine-color-teal-4)' : 'var(--mantine-color-dark-1)',
              fontWeight: pathname === '/dashboard' ? 500 : 400,
              fontSize: '0.875rem',
            }}
          />
          <NavLink
            component={Link}
            href="/team"
            label="Команда"
            leftSection={<IconUsers size={16} stroke={1.5} />}
            active={pathname === '/team'}
            color="teal"
            variant="light"
            onClick={() => onNavigate?.()}
            style={{
              borderRadius: 'var(--mantine-radius-sm)',
              color: pathname === '/team' ? 'var(--mantine-color-teal-4)' : 'var(--mantine-color-dark-1)',
              fontWeight: pathname === '/team' ? 500 : 400,
              fontSize: '0.875rem',
            }}
          />
        </Stack>
      </Box>

      <Box px="xs" pb="md">
        <Divider color="dark.5" mb="sm" />
        <UnstyledButton w="100%" px="sm" py={6} style={{ borderRadius: 'var(--mantine-radius-sm)' }}>
          <Group gap="sm">
            <Avatar size={28} radius="xl" color="teal" variant="light" style={{ fontSize: '0.65rem' }}>
              {initials}
            </Avatar>
            <Box style={{ flex: 1, overflow: 'hidden' }}>
              <Text size="xs" c="white" truncate fw={500}>{userName}</Text>
              <Text size="xs" c="dark.3" truncate>{ROLE_LABELS[profile?.role ?? ''] ?? 'Агент'}</Text>
            </Box>
          </Group>
        </UnstyledButton>
        <Button
          variant="subtle"
          color="dark.3"
          fullWidth
          leftSection={<IconLogout size={14} />}
          onClick={handleLogout}
          justify="flex-start"
          mt={2}
          fw={400}
          size="xs"
        >
          Вийти
        </Button>
      </Box>
    </Stack>
  );
}
