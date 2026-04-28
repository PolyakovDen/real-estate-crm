'use client';

import { useState, useEffect } from 'react';
import {
  Group, Burger, Text,
  ActionIcon, useMantineColorScheme, useComputedColorScheme,
} from '@mantine/core';
import { usePathname } from 'next/navigation';
import { IconSun, IconMoon } from '@tabler/icons-react';

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/properties': "Об'єкти",
  '/properties/new': "Новий об'єкт",
  '/dashboard': 'Дашборд',
  '/team': 'Команда',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (/^\/properties\/[^/]+\/edit$/.test(pathname)) return 'Редагування';
  if (/^\/properties\/[^/]+$/.test(pathname)) return "Деталі об'єкту";
  return '';
}

export function Header({ opened, toggle }: HeaderProps) {
  const pathname = usePathname();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const [mounted, setMounted] = useState(false);
  const title = getPageTitle(pathname);

  useEffect(() => setMounted(true), []);

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        {title && (
          <Text size="sm" fw={500} truncate>{title}</Text>
        )}
      </Group>

      <Group gap="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="md"
          onClick={() => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle color scheme"
        >
          {mounted && computedColorScheme === 'dark'
            ? <IconSun size={16} stroke={1.5} />
            : <IconMoon size={16} stroke={1.5} />}
        </ActionIcon>
      </Group>
    </Group>
  );
}
