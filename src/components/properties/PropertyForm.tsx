'use client';

import { useForm } from '@mantine/form';
import {
  TextInput, Textarea, NumberInput, Select, Button, Group, Stack,
  Grid, Paper, Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { propertyFormSchema, type PropertyFormValues } from '@/lib/schemas/property';
import {
  PROPERTY_TYPE_LABELS, DEAL_TYPE_LABELS,
  STATUS_LABELS, CONDITION_LABELS, LISTING_TYPE_LABELS,
} from '@/lib/utils/constants';
import { useCreateProperty, useUpdateProperty } from '@/hooks/useProperties';
import type { z } from 'zod';

interface PropertyFormProps {
  initialValues?: Partial<PropertyFormValues>;
  propertyId?: string;
  mode: 'create' | 'edit';
}

function toOptions(obj: Record<string, string>) {
  return Object.entries(obj).map(([value, label]) => ({ value, label }));
}

function createZodValidate<T>(schema: z.ZodSchema<T>) {
  return (values: T) => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (path && !errors[path]) {
        errors[path] = issue.message;
      }
    });
    return errors;
  };
}

export function PropertyForm({ initialValues, propertyId, mode }: PropertyFormProps) {
  const router = useRouter();
  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty(propertyId ?? '');
  const isMobile = useMediaQuery('(max-width: 48em)');

  const form = useForm<PropertyFormValues>({
    initialValues: {
      property_type: 'apartment',
      deal_type: 'sale',
      status: 'draft',
      title: '',
      description: '',
      city: '',
      district: '',
      street: '',
      building_number: '',
      total_area: undefined,
      living_area: undefined,
      rooms: undefined,
      bedrooms: undefined,
      floor: undefined,
      total_floors: undefined,
      price: 0,
      currency: 'USD',
      commission_percent: undefined,
      condition: undefined,
      listing_type: 'non_exclusive',
      year_built: undefined,
      exclusive_until: '',
      owner_name: '',
      owner_phone: '',
      owner_notes: '',
      ...initialValues,
    },
    validate: createZodValidate(propertyFormSchema),
  });

  const handleSubmit = async (values: PropertyFormValues) => {
    if (mode === 'create') {
      const result = await createMutation.mutateAsync(values);
      router.push(`/properties/${result.id}`);
    } else if (propertyId) {
      await updateMutation.mutateAsync(values);
      router.push(`/properties/${propertyId}`);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const sectionPadding = isMobile ? 'sm' : 'lg';
  const inputSize = isMobile ? 'xs' : 'sm';

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap={isMobile ? 'sm' : 'lg'}>
        <Paper p={sectionPadding} withBorder>
          <Title order={4} size={isMobile ? 'h4' : undefined} mb={isMobile ? 'xs' : 'md'}>Тип і статус</Title>
          <Grid gap={isMobile ? 'xs' : 'md'}>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Тип нерухомості"
                required
                size={inputSize}
                data={toOptions(PROPERTY_TYPE_LABELS)}
                {...form.getInputProps('property_type')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <Select
                label="Тип угоди"
                required
                size={inputSize}
                data={toOptions(DEAL_TYPE_LABELS)}
                {...form.getInputProps('deal_type')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <Select
                label="Статус"
                required
                size={inputSize}
                data={toOptions(STATUS_LABELS)}
                {...form.getInputProps('status')}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper p={sectionPadding} withBorder>
          <Title order={4} size={isMobile ? 'h4' : undefined} mb={isMobile ? 'xs' : 'md'}>Основна інформація</Title>
          <Stack gap={isMobile ? 'xs' : 'md'}>
            <TextInput
              label="Заголовок"
              placeholder="2-кімнатна квартира на Печерську"
              required
              size={inputSize}
              {...form.getInputProps('title')}
            />
            <Textarea
              label="Опис"
              placeholder="Детальний опис об'єкта..."
              minRows={isMobile ? 3 : 4}
              autosize
              size={inputSize}
              {...form.getInputProps('description')}
            />
          </Stack>
        </Paper>

        <Paper p={sectionPadding} withBorder>
          <Title order={4} size={isMobile ? 'h4' : undefined} mb={isMobile ? 'xs' : 'md'}>Локація</Title>
          <Grid gap={isMobile ? 'xs' : 'md'}>
            <Grid.Col span={{ base: 6, sm: 6 }}>
              <TextInput
                label="Місто"
                required
                placeholder="Київ"
                size={inputSize}
                {...form.getInputProps('city')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 6 }}>
              <TextInput
                label="Район"
                placeholder="Печерський"
                size={inputSize}
                {...form.getInputProps('district')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 8, sm: 8 }}>
              <TextInput
                label="Вулиця"
                placeholder="вул. Хрещатик"
                size={inputSize}
                {...form.getInputProps('street')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 4, sm: 4 }}>
              <TextInput
                label="Будинок"
                placeholder="22"
                size={inputSize}
                {...form.getInputProps('building_number')}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper p={sectionPadding} withBorder>
          <Title order={4} size={isMobile ? 'h4' : undefined} mb={isMobile ? 'xs' : 'md'}>Параметри</Title>
          <Grid gap={isMobile ? 'xs' : 'md'}>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <NumberInput
                label={isMobile ? 'Площа, м²' : 'Загальна площа, м²'}
                min={0}
                decimalScale={2}
                size={inputSize}
                {...form.getInputProps('total_area')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <NumberInput
                label="Житлова, м²"
                min={0}
                decimalScale={2}
                size={inputSize}
                {...form.getInputProps('living_area')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <NumberInput
                label="Кімнат"
                min={0}
                max={20}
                size={inputSize}
                {...form.getInputProps('rooms')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <NumberInput
                label="Спалень"
                min={0}
                max={20}
                size={inputSize}
                {...form.getInputProps('bedrooms')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Select
                label="Стан"
                data={toOptions(CONDITION_LABELS)}
                clearable
                size={inputSize}
                {...form.getInputProps('condition')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 4, sm: 3 }}>
              <NumberInput
                label="Поверх"
                size={inputSize}
                {...form.getInputProps('floor')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 4, sm: 3 }}>
              <NumberInput
                label={isMobile ? 'Поверхів' : 'Поверхів у будинку'}
                min={1}
                size={inputSize}
                {...form.getInputProps('total_floors')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 4, sm: 3 }}>
              <NumberInput
                label="Рік"
                min={1800}
                max={new Date().getFullYear() + 5}
                size={inputSize}
                {...form.getInputProps('year_built')}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper p={sectionPadding} withBorder>
          <Title order={4} size={isMobile ? 'h4' : undefined} mb={isMobile ? 'xs' : 'md'}>Ціна</Title>
          <Grid gap={isMobile ? 'xs' : 'md'}>
            <Grid.Col span={{ base: 8, sm: 8 }}>
              <NumberInput
                label="Ціна"
                required
                min={0}
                thousandSeparator=" "
                size={inputSize}
                {...form.getInputProps('price')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 4, sm: 4 }}>
              <Select
                label="Валюта"
                data={['USD', 'EUR', 'UAH']}
                size={inputSize}
                {...form.getInputProps('currency')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <NumberInput
                label="Комісія, %"
                min={0}
                max={100}
                decimalScale={2}
                size={inputSize}
                {...form.getInputProps('commission_percent')}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper p={sectionPadding} withBorder>
          <Title order={4} size={isMobile ? 'h4' : undefined} mb={isMobile ? 'xs' : 'md'}>Договір</Title>
          <Grid gap={isMobile ? 'xs' : 'md'}>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <Select
                label="Тип лістингу"
                data={toOptions(LISTING_TYPE_LABELS)}
                size={inputSize}
                {...form.getInputProps('listing_type')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <TextInput
                label="Ексклюзив до"
                type="date"
                size={inputSize}
                {...form.getInputProps('exclusive_until')}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper p={sectionPadding} withBorder>
          <Title order={4} size={isMobile ? 'h4' : undefined} mb={isMobile ? 'xs' : 'md'}>Власник</Title>
          <Stack gap={isMobile ? 'xs' : 'md'}>
            <Grid gap={isMobile ? 'xs' : 'md'}>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="ПІБ власника"
                  size={inputSize}
                  {...form.getInputProps('owner_name')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Телефон"
                  placeholder="+380..."
                  size={inputSize}
                  {...form.getInputProps('owner_phone')}
                />
              </Grid.Col>
            </Grid>
            <Textarea
              label="Нотатки"
              placeholder="Особливості, побажання..."
              minRows={isMobile ? 2 : 3}
              autosize
              size={inputSize}
              {...form.getInputProps('owner_notes')}
            />
          </Stack>
        </Paper>

        {isMobile ? (
          <Stack gap="xs">
            <Button type="submit" loading={isLoading} fullWidth size="sm">
              {mode === 'create' ? 'Створити' : 'Зберегти'}
            </Button>
            <Button variant="subtle" onClick={() => router.back()} fullWidth size="xs">
              Скасувати
            </Button>
          </Stack>
        ) : (
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => router.back()}>
              Скасувати
            </Button>
            <Button type="submit" loading={isLoading}>
              {mode === 'create' ? 'Створити' : 'Зберегти'}
            </Button>
          </Group>
        )}
      </Stack>
    </form>
  );
}
