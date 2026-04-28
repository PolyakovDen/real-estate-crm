'use client';

import { AppShell, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding={{ base: 'sm', sm: 'lg' }}
      styles={{
        navbar: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderRight: 'none',
        },
        header: {
          borderBottom: '1px solid var(--mantine-color-default-border)',
        },
      }}
    >
      <AppShell.Header>
        <Header opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar onNavigate={close} />
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
        <Box hiddenFrom="sm" style={{ height: 60 }} />
      </AppShell.Main>

      <MobileNav />
    </AppShell>
  );
}
