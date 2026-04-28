'use client';

import { useParams } from 'next/navigation';
import { Container, Title, Stack, Loader, Center, Paper } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { PhotoUploader } from '@/components/properties/PhotoUploader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProperty } from '@/hooks/useProperties';
import type { PropertyFormValues } from '@/lib/schemas/property';

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading } = useProperty(id);
  const isMobile = useMediaQuery('(max-width: 48em)');

  if (isLoading) {
    return <Center h={300}><Loader size="sm" /></Center>;
  }

  if (!property) {
    return (
      <Container size="lg" py="xl">
        <EmptyState
          title="Об'єкт не знайдено"
          description="Можливо, його було видалено або у вас немає доступу"
          actionLabel="До списку"
          actionHref="/properties"
        />
      </Container>
    );
  }

  const initialValues: Partial<PropertyFormValues> = {
    property_type: property.property_type,
    deal_type: property.deal_type,
    status: property.status,
    title: property.title,
    description: property.description ?? undefined,
    city: property.city,
    district: property.district ?? undefined,
    street: property.street ?? undefined,
    building_number: property.building_number ?? undefined,
    total_area: property.total_area ? Number(property.total_area) : undefined,
    living_area: property.living_area ? Number(property.living_area) : undefined,
    rooms: property.rooms ?? undefined,
    bedrooms: (property as unknown as Record<string, unknown>).bedrooms as number | undefined ?? undefined,
    floor: property.floor ?? undefined,
    total_floors: property.total_floors ?? undefined,
    price: Number(property.price),
    currency: property.currency as 'USD' | 'EUR' | 'UAH',
    commission_percent: (property as unknown as Record<string, unknown>).commission_percent
      ? Number((property as unknown as Record<string, unknown>).commission_percent) : undefined,
    condition: property.condition ?? undefined,
    listing_type: ((property as unknown as Record<string, unknown>).listing_type as 'exclusive' | 'non_exclusive' | 'info') ?? 'non_exclusive',
    exclusive_until: ((property as unknown as Record<string, unknown>).exclusive_until as string) ?? '',
    year_built: property.year_built ?? undefined,
    owner_name: property.owner_name ?? undefined,
    owner_phone: property.owner_phone ?? undefined,
    owner_notes: property.owner_notes ?? undefined,
  };

  return (
    <Container size="lg" py={isMobile ? 'xs' : 'md'} px={0}>
      <Stack gap={isMobile ? 'sm' : 'lg'}>
        <Title order={isMobile ? 3 : 2} style={{ wordBreak: 'break-word' }}>
          {isMobile ? property.title : `Редагувати: ${property.title}`}
        </Title>

        <Paper p={isMobile ? 'sm' : 'lg'} withBorder>
          <PhotoUploader propertyId={id} photos={property.photos} />
        </Paper>

        <PropertyForm
          mode="edit"
          propertyId={id}
          initialValues={initialValues}
        />
      </Stack>
    </Container>
  );
}
