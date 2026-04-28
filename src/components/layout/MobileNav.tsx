'use client';

import { Text, Stack, Box } from '@mantine/core';
import { IconBuilding, IconPlus, IconChartBar, IconUsers } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { label: "Об'єкти", href: '/properties', icon: IconBuilding },
  { label: 'Додати', href: '/properties/new', icon: IconPlus },
  { label: 'Дашборд', href: '/dashboard', icon: IconChartBar },
  { label: 'Команда', href: '/team', icon: IconUsers },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Box
      component="nav"
      aria-label="Основна навігація"
      hiddenFrom="sm"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        borderTop: '1px solid var(--mantine-color-default-border)',
        backgroundColor: 'var(--mantine-color-body)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        display: 'flex',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === '/properties'
          ? pathname === '/properties' || (pathname.startsWith('/properties/') && !pathname.endsWith('/new'))
          : pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 8,
              paddingBottom: 8,
              textDecoration: 'none',
              color: 'inherit',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Stack gap={2} align="center">
              <item.icon
                size={20}
                stroke={1.5}
                color={isActive ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-dimmed)'}
              />
              <Text
                size="xs"
                c={isActive ? 'teal.6' : 'dimmed'}
                fw={isActive ? 500 : 400}
                style={{ fontSize: '0.625rem' }}
              >
                {item.label}
              </Text>
            </Stack>
          </Link>
        );
      })}
    </Box>
  );
}
