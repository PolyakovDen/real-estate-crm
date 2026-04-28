'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Container, Title, Group, Button, Stack, Paper, Grid,
  Text, Badge, Center, Avatar,
  ThemeIcon, SimpleGrid, Box,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconEdit, IconArrowLeft, IconTrash,
  IconMapPin, IconPhone, IconHome2,
} from '@tabler/icons-react';
import Link from 'next/link';
import { modals } from '@mantine/modals';
import { PhotoGallery } from '@/components/properties/PhotoGallery';
import { PriceHistory } from '@/components/properties/PriceHistory';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { useProperty, useDeleteProperty } from '@/hooks/useProperties';
import { usePropertyActivity } from '@/hooks/useActivity';
import {
  PROPERTY_TYPE_LABELS, DEAL_TYPE_LABELS,
  STATUS_LABELS, STATUS_COLORS, CONDITION_LABELS,
} from '@/lib/utils/constants';
import { formatPrice, formatArea, formatFloor, formatDate } from '@/lib/utils/format';
import { SectionTitle } from '@/components/ui/SectionTitle';

function ParamItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="sm" fw={500}>{value}</Text>
    </div>
  );
}

function ShimmerBlock({ height }: { height: number }) {
  return <Box className="shimmer-skeleton" style={{ height, width: '100%' }} />;
}

function DetailSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <Container size="xl" py={isMobile ? 'xs' : 'md'}>
      <Stack gap="md">
        <ShimmerBlock height={28} />
        <ShimmerBlock height={isMobile ? 100 : 160} />
        <ShimmerBlock height={100} />
        <ShimmerBlock height={120} />
      </Stack>
    </Container>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: property, isLoading } = useProperty(id);
  const deleteMutation = useDeleteProperty();
  const { data: activityData, isLoading: activityLoading } = usePropertyActivity(id);
  const isMobile = useMediaQuery('(max-width: 48em)');

  const handleDelete = () => {
    modals.openConfirmModal({
      title: "Видалити об'єкт?",
      children: (
        <Text size="sm">
          Ви впевнені, що хочете видалити цей об&#39;єкт? Цю дію не можна скасувати.
        </Text>
      ),
      labels: { confirm: 'Видалити', cancel: 'Скасувати' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        router.push('/properties');
      },
    });
  };

  if (isLoading) return <DetailSkeleton isMobile={!!isMobile} />;

  if (!property) {
    return (
      <Container>
        <Center h={300}>
          <Stack align="center" gap="sm">
            <ThemeIcon size={40} radius="xl" variant="light" color="gray">
              <IconHome2 size={20} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">Об&#39;єкт не знайдено</Text>
            <Button component={Link} href="/properties" variant="light" color="teal" size="xs">
              До списку
            </Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  const agentName = property.agent?.full_name ?? 'Невідомо';
  const agentInitials = agentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const pp = isMobile ? 'sm' : 'lg';
  const gap = isMobile ? 'sm' : 'lg';

  return (
    <Container size="xl" py={isMobile ? 'xs' : 'md'} px={0}>
      <Stack gap={gap}>
        {/* Back button */}
        <Button
          component={Link}
          href="/properties"
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={14} />}
          size="xs"
          px={0}
          w="fit-content"
          fw={400}
        >
          Назад
        </Button>

        {/* Title + actions */}
        {isMobile ? (
          <Stack gap="xs">
            <Group gap="xs" wrap="wrap" align="center">
              <Title order={3} style={{ wordBreak: 'break-word', flex: 1 }}>
                {property.title}
              </Title>
              <Badge color={STATUS_COLORS[property.status] ?? 'gray'} variant="light" size="sm">
                {STATUS_LABELS[property.status] ?? property.status}
              </Badge>
            </Group>
            <Group gap={4} wrap="wrap">
              <Text size="xs" c="dimmed">{PROPERTY_TYPE_LABELS[property.property_type]}</Text>
              <Text size="xs" c="dimmed">·</Text>
              <Text size="xs" c="dimmed">{DEAL_TYPE_LABELS[property.deal_type]}</Text>
            </Group>
            <Group gap="xs">
              <Button
                component={Link}
                href={`/properties/${id}/edit`}
                leftSection={<IconEdit size={14} />}
                variant="light"
                color="teal"
                size="xs"
                style={{ flex: 1 }}
              >
                Редагувати
              </Button>
              <Button
                color="red"
                variant="subtle"
                leftSection={<IconTrash size={14} />}
                onClick={handleDelete}
                loading={deleteMutation.isPending}
                size="xs"
              >
                Видалити
              </Button>
            </Group>
          </Stack>
        ) : (
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="sm" wrap="wrap" align="center">
                <Title order={2} style={{ wordBreak: 'break-word' }}>
                  {property.title}
                </Title>
                <Badge color={STATUS_COLORS[property.status] ?? 'gray'} variant="light">
                  {STATUS_LABELS[property.status] ?? property.status}
                </Badge>
              </Group>
              <Group gap="xs" mt={4}>
                <Text size="xs" c="dimmed">{PROPERTY_TYPE_LABELS[property.property_type]}</Text>
                <Text size="xs" c="dimmed">·</Text>
                <Text size="xs" c="dimmed">{DEAL_TYPE_LABELS[property.deal_type]}</Text>
                <Text size="xs" c="dimmed">·</Text>
                <Text size="xs" c="dimmed">Створено {formatDate(property.created_at)}</Text>
              </Group>
            </Box>
            <Group gap="xs" wrap="nowrap">
              <Button
                component={Link}
                href={`/properties/${id}/edit`}
                leftSection={<IconEdit size={14} />}
                variant="light"
                color="teal"
                size="sm"
              >
                Редагувати
              </Button>
              <Button
                color="red"
                variant="subtle"
                leftSection={<IconTrash size={14} />}
                onClick={handleDelete}
                loading={deleteMutation.isPending}
                size="sm"
              >
                Видалити
              </Button>
            </Group>
          </Group>
        )}

        {/* Photos */}
        <PhotoGallery photos={property.photos} />

        {/* Price — full width on mobile, first */}
        {isMobile ? (
          <Paper p={pp} withBorder>
            <Group justify="space-between" align="flex-end">
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>Ціна</Text>
                <Text fw={700} style={{ fontSize: '1.5rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  {formatPrice(Number(property.price), property.currency)}
                </Text>
              </Box>
              {property.price_per_sqm && (
                <Text size="xs" c="dimmed">
                  {formatPrice(Number(property.price_per_sqm), property.currency)} / м²
                </Text>
              )}
            </Group>
          </Paper>
        ) : null}

        <Grid gap={isMobile ? 'sm' : 'lg'}>
          {/* Price — sidebar on desktop only */}
          {!isMobile && (
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper p={pp} withBorder>
                <SectionTitle>Ціна</SectionTitle>
                <Text fw={700} style={{ fontSize: '2rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  {formatPrice(Number(property.price), property.currency)}
                </Text>
                {property.price_per_sqm && (
                  <Text size="sm" c="dimmed" mt={4}>
                    {formatPrice(Number(property.price_per_sqm), property.currency)} / м²
                  </Text>
                )}
              </Paper>
            </Grid.Col>
          )}

          {/* Parameters */}
          <Grid.Col span={{ base: 12, md: isMobile ? 12 : 8 }}>
            <Paper p={pp} withBorder>
              <SectionTitle>Параметри</SectionTitle>
              <SimpleGrid cols={{ base: 2, sm: 3 }} spacing={isMobile ? 'sm' : 'lg'}>
                {property.total_area && (
                  <ParamItem label="Площа" value={formatArea(Number(property.total_area))} />
                )}
                {property.rooms != null && (
                  <ParamItem label="Кімнат" value={property.rooms} />
                )}
                {property.floor != null && (
                  <ParamItem label="Поверх" value={formatFloor(property.floor, property.total_floors)} />
                )}
                {property.condition && (
                  <ParamItem label="Стан" value={CONDITION_LABELS[property.condition] ?? property.condition} />
                )}
                {property.year_built && (
                  <ParamItem label="Рік" value={property.year_built} />
                )}
                {property.living_area && (
                  <ParamItem label="Житлова" value={formatArea(Number(property.living_area))} />
                )}
              </SimpleGrid>
            </Paper>
          </Grid.Col>

          {/* Description */}
          {property.description && (
            <Grid.Col span={12}>
              <Paper p={pp} withBorder>
                <SectionTitle>Опис</SectionTitle>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }} c="dimmed">
                  {property.description}
                </Text>
              </Paper>
            </Grid.Col>
          )}

          {/* Location + Agent row */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p={pp} withBorder h="100%">
              <SectionTitle>Локація</SectionTitle>
              <Group gap={4} wrap="nowrap">
                <IconMapPin size={13} color="var(--mantine-color-dimmed)" stroke={1.5} style={{ flexShrink: 0 }} />
                <Text size="sm" fw={500}>
                  {property.city}{property.district ? `, ${property.district}` : ''}
                </Text>
              </Group>
              {property.street && (
                <Text c="dimmed" size="xs" mt={2} ml={17}>
                  {property.street} {property.building_number ?? ''}
                </Text>
              )}
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p={pp} withBorder h="100%">
              <SectionTitle>Агент</SectionTitle>
              {property.agent ? (
                <Group gap="sm" wrap="nowrap">
                  <Avatar size={isMobile ? 28 : 'sm'} radius="xl" color="teal" variant="light" style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                    {agentInitials}
                  </Avatar>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>{property.agent.full_name}</Text>
                    {property.agent.phone && (
                      <Text size="xs" c="dimmed">{property.agent.phone}</Text>
                    )}
                  </Box>
                </Group>
              ) : (
                <Text size="sm" c="dimmed">Не призначено</Text>
              )}
            </Paper>
          </Grid.Col>

          {/* Owner */}
          {(property.owner_name || property.owner_phone) && (
            <Grid.Col span={12}>
              <Paper p={pp} withBorder>
                <SectionTitle>Власник</SectionTitle>
                <Group gap={isMobile ? 'sm' : 'xl'} wrap="wrap">
                  {property.owner_name && <Text size="sm" fw={500}>{property.owner_name}</Text>}
                  {property.owner_phone && (
                    <Group gap={4}>
                      <IconPhone size={13} color="var(--mantine-color-dimmed)" stroke={1.5} />
                      <Text size="sm" c="dimmed">{property.owner_phone}</Text>
                    </Group>
                  )}
                  {property.owner_notes && (
                    <Text size="sm" c="dimmed" style={{ wordBreak: 'break-word', width: '100%' }}>
                      {property.owner_notes}
                    </Text>
                  )}
                </Group>
              </Paper>
            </Grid.Col>
          )}

          {/* Price History */}
          <Grid.Col span={12}>
            <Paper p={pp} withBorder>
              <SectionTitle>Історія ціни</SectionTitle>
              <PriceHistory propertyId={id} />
            </Paper>
          </Grid.Col>

          {/* Activity Log */}
          <Grid.Col span={12}>
            <Paper p={pp} withBorder>
              <SectionTitle>Історія змін</SectionTitle>
              <ActivityTimeline
                data={activityData ?? []}
                isLoading={activityLoading}
                showEntityLink={false}
              />
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
