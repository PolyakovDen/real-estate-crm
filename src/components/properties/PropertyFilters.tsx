'use client';

import { TextInput, Select, Group, ActionIcon, Tooltip, Stack, Collapse, UnstyledButton, Text, Box } from '@mantine/core';
import { useDebouncedValue, useMediaQuery, useDisclosure } from '@mantine/hooks';
import { IconSearch, IconX, IconChevronDown, IconChevronUp, IconFilter } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { PROPERTY_TYPE_LABELS, STATUS_LABELS } from '@/lib/utils/constants';
import type { PropertyFilters as FilterType } from '@/hooks/useProperties';

function toOptions(obj: Record<string, string>) {
  return Object.entries(obj).map(([value, label]) => ({ value, label }));
}

interface PropertyFiltersProps {
  value: FilterType;
  onChange: (filters: FilterType) => void;
}

export function PropertyFilters({ value, onChange }: PropertyFiltersProps) {
  const [search, setSearch] = useState(value.search ?? '');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const isMobile = useMediaQuery('(max-width: 48em)');
  const [filtersOpen, { toggle: toggleFilters }] = useDisclosure(false);

  useEffect(() => {
    onChange({ ...value, search: debouncedSearch || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleReset = () => {
    setSearch('');
    onChange({});
  };

  const hasFilters = value.status || value.property_type || value.city || search;
  const activeFilterCount = [value.status, value.property_type, value.city].filter(Boolean).length;

  if (isMobile) {
    return (
      <Stack gap="xs" style={{ flex: 1, width: '100%' }}>
        <Group gap="xs" wrap="nowrap">
          <TextInput
            placeholder="Пошук..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="xs"
            style={{ flex: 1 }}
          />
          <UnstyledButton onClick={toggleFilters} px={8} py={4}>
            <Group gap={4} wrap="nowrap">
              <IconFilter size={14} color="var(--mantine-color-dimmed)" />
              {activeFilterCount > 0 && (
                <Box
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: 'var(--mantine-color-teal-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text size="xs" c="white" style={{ fontSize: '0.6rem', lineHeight: 1 }}>{activeFilterCount}</Text>
                </Box>
              )}
            </Group>
          </UnstyledButton>
          {hasFilters && (
            <ActionIcon variant="subtle" color="gray" onClick={handleReset} size="sm">
              <IconX size={14} />
            </ActionIcon>
          )}
        </Group>
        <Collapse expanded={filtersOpen}>
          <Stack gap="xs">
            <Group gap="xs" grow>
              <Select
                placeholder="Статус"
                data={toOptions(STATUS_LABELS)}
                value={value.status ?? null}
                onChange={(v) => onChange({ ...value, status: v ?? undefined })}
                clearable
                size="xs"
              />
              <Select
                placeholder="Тип"
                data={toOptions(PROPERTY_TYPE_LABELS)}
                value={value.property_type ?? null}
                onChange={(v) => onChange({ ...value, property_type: v ?? undefined })}
                clearable
                size="xs"
              />
            </Group>
            <TextInput
              placeholder="Місто"
              value={value.city ?? ''}
              onChange={(e) => onChange({ ...value, city: e.currentTarget.value || undefined })}
              size="xs"
            />
          </Stack>
        </Collapse>
      </Stack>
    );
  }

  return (
    <Group gap="xs" wrap="wrap" style={{ flex: 1 }}>
      <TextInput
        placeholder="Пошук..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        size="sm"
        style={{ flex: 1, minWidth: 180 }}
      />
      <Select
        placeholder="Статус"
        data={toOptions(STATUS_LABELS)}
        value={value.status ?? null}
        onChange={(v) => onChange({ ...value, status: v ?? undefined })}
        clearable
        size="sm"
        w={160}
      />
      <Select
        placeholder="Тип"
        data={toOptions(PROPERTY_TYPE_LABELS)}
        value={value.property_type ?? null}
        onChange={(v) => onChange({ ...value, property_type: v ?? undefined })}
        clearable
        size="sm"
        w={160}
      />
      <TextInput
        placeholder="Місто"
        value={value.city ?? ''}
        onChange={(e) => onChange({ ...value, city: e.currentTarget.value || undefined })}
        size="sm"
        w={130}
      />
      {hasFilters && (
        <Tooltip label="Скинути фільтри">
          <ActionIcon variant="subtle" color="gray" onClick={handleReset} size="lg">
            <IconX size={16} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}
