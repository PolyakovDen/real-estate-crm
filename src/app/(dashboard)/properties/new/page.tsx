'use client';

import { Container, Title, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { PropertyForm } from '@/components/properties/PropertyForm';

export default function NewPropertyPage() {
  const isMobile = useMediaQuery('(max-width: 48em)');

  return (
    <Container size="lg" py={isMobile ? 'xs' : 'md'} px={0}>
      <Stack gap={isMobile ? 'sm' : 'lg'}>
        <Title order={isMobile ? 3 : 2}>Новий об&#39;єкт</Title>
        <PropertyForm mode="create" />
      </Stack>
    </Container>
  );
}
