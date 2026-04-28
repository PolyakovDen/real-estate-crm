'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Table, Text, Group, Box, UnstyledButton, Pagination,
} from '@mantine/core';
import {
  IconChevronUp, IconChevronDown, IconSelector,
  IconPhoto, IconChevronRight,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import {
  PROPERTY_TYPE_LABELS, DEAL_TYPE_LABELS,
  STATUS_LABELS, STATUS_DOT_COLORS,
} from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/format';
import type { PropertyListItem } from '@/types/property';

interface PropertyTableProps {
  data: PropertyListItem[];
}

type SortField = 'title' | 'city' | 'price' | 'status' | 'created_at';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 20;

function SortHeader({
  label,
  field,
  active,
  dir,
  onSort,
  align,
}: {
  label: string;
  field: SortField;
  active: boolean;
  dir: SortDir;
  onSort: (field: SortField) => void;
  align?: 'left' | 'right';
}) {
  const Icon = active ? (dir === 'asc' ? IconChevronUp : IconChevronDown) : IconSelector;

  return (
    <UnstyledButton
      onClick={() => onSort(field)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        width: '100%',
        userSelect: 'none',
      }}
    >
      <Text
        size="xs"
        fw={600}
        c={active ? undefined : 'dimmed'}
        tt="uppercase"
        style={{ letterSpacing: '0.04em', fontSize: '0.6875rem' }}
      >
        {label}
      </Text>
      <Icon
        size={12}
        color={active ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-gray-4)'}
        stroke={2}
      />
    </UnstyledButton>
  );
}

function StaticHeader({ label, align }: { label: string; align?: 'left' | 'right' }) {
  return (
    <Text
      size="xs"
      fw={600}
      c="dimmed"
      tt="uppercase"
      style={{
        letterSpacing: '0.04em',
        fontSize: '0.6875rem',
        textAlign: align ?? 'left',
      }}
    >
      {label}
    </Text>
  );
}

function Thumbnail({ url }: { url?: string }) {
  if (url) {
    return (
      <Box
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0,
          border: '1px solid var(--mantine-color-default-border)',
        }}
      />
    );
  }

  return (
    <Box
      className="property-thumb-empty"
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'var(--mantine-color-gray-1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <IconPhoto size={16} color="var(--mantine-color-gray-4)" stroke={1.5} />
    </Box>
  );
}

export function PropertyTable({ data }: PropertyTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  }, [sortField]);

  const sorted = useMemo(() => {
    const items = [...data];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title, 'uk');
          break;
        case 'city':
          cmp = a.city.localeCompare(b.city, 'uk');
          break;
        case 'price':
          cmp = Number(a.price) - Number(b.price);
          break;
        case 'status':
          cmp = (STATUS_LABELS[a.status] ?? a.status).localeCompare(STATUS_LABELS[b.status] ?? b.status, 'uk');
          break;
        case 'created_at':
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [data, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, sorted.length);

  return (
    <Box>
      <Table.ScrollContainer minWidth={680}>
        <Table
          verticalSpacing={8}
          horizontalSpacing="sm"
          styles={{
            table: { tableLayout: 'fixed' },
            th: {
              borderBottom: 'none',
              paddingTop: 6,
              paddingBottom: 10,
            },
            td: {
              borderColor: 'var(--mantine-color-default-border)',
              verticalAlign: 'middle',
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '38%' }}>
                <SortHeader label="Об'єкт" field="title" active={sortField === 'title'} dir={sortDir} onSort={handleSort} />
              </Table.Th>
              <Table.Th style={{ width: '13%' }}>
                <StaticHeader label="Тип" />
              </Table.Th>
              <Table.Th style={{ width: '16%' }}>
                <SortHeader label="Місто" field="city" active={sortField === 'city'} dir={sortDir} onSort={handleSort} />
              </Table.Th>
              <Table.Th style={{ width: '17%', textAlign: 'right' }}>
                <SortHeader label="Ціна" field="price" active={sortField === 'price'} dir={sortDir} onSort={handleSort} align="right" />
              </Table.Th>
              <Table.Th style={{ width: '13%' }}>
                <SortHeader label="Статус" field="status" active={sortField === 'status'} dir={sortDir} onSort={handleSort} />
              </Table.Th>
              <Table.Th style={{ width: '3%' }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paged.map((property) => {
              const coverPhoto = property.photos?.find((p) => p.is_cover) ?? property.photos?.[0];
              const isHovered = hoveredId === property.id;

              const meta: string[] = [];
              if (property.total_area) meta.push(`${property.total_area} м²`);
              if (property.rooms) meta.push(`${property.rooms} кімн.`);
              const metaStr = meta.length > 0
                ? `${DEAL_TYPE_LABELS[property.deal_type] ?? property.deal_type} · ${meta.join(' · ')}`
                : DEAL_TYPE_LABELS[property.deal_type] ?? property.deal_type;

              return (
                <Table.Tr
                  key={property.id}
                  className="property-table-row"
                  tabIndex={0}
                  role="link"
                  aria-label={property.title}
                  onClick={() => router.push(`/properties/${property.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/properties/${property.id}`);
                    }
                  }}
                  onMouseEnter={() => setHoveredId(property.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(property.id)}
                  onBlur={() => setHoveredId(null)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isHovered ? 'var(--mantine-color-gray-0)' : undefined,
                    transition: 'background-color 120ms ease',
                  }}
                >
                  <Table.Td>
                    <Group gap={10} wrap="nowrap">
                      <Thumbnail url={coverPhoto?.url} />
                      <Box style={{ minWidth: 0, flex: 1 }}>
                        <Text
                          size="sm"
                          fw={500}
                          truncate
                          style={{
                            color: isHovered ? 'var(--mantine-color-teal-6)' : undefined,
                            transition: 'color 120ms ease',
                          }}
                        >
                          {property.title}
                        </Text>
                        <Text size="xs" c="dimmed" truncate style={{ lineHeight: 1.3, marginTop: 1 }}>
                          {metaStr}
                        </Text>
                      </Box>
                    </Group>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {PROPERTY_TYPE_LABELS[property.property_type] ?? property.property_type}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="sm" truncate>{property.city}</Text>
                    {property.district && (
                      <Text size="xs" c="dimmed" truncate style={{ lineHeight: 1.3, marginTop: 1 }}>
                        {property.district}
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>
                      {formatPrice(Number(property.price), property.currency)}
                    </Text>
                    {property.price_per_sqm && (
                      <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap', lineHeight: 1.3, marginTop: 1 }}>
                        {formatPrice(Number(property.price_per_sqm), property.currency)}/м²
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <Box
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: STATUS_DOT_COLORS[property.status] ?? 'var(--mantine-color-gray-4)',
                          flexShrink: 0,
                        }}
                      />
                      <Text size="xs">{STATUS_LABELS[property.status] ?? property.status}</Text>
                    </Group>
                  </Table.Td>

                  <Table.Td style={{ textAlign: 'center', padding: '0 4px' }}>
                    <IconChevronRight
                      size={14}
                      color="var(--mantine-color-gray-4)"
                      stroke={1.5}
                      style={{
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translateX(0)' : 'translateX(-4px)',
                        transition: 'opacity 120ms ease, transform 120ms ease',
                      }}
                    />
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {(totalPages > 1 || sorted.length > 0) && (
        <Group justify="space-between" align="center" mt="sm" px="xs">
          <Text size="xs" c="dimmed">
            {sorted.length > PAGE_SIZE
              ? `${from}–${to} з ${sorted.length}`
              : `${sorted.length} об'єктів`
            }
          </Text>
          {totalPages > 1 && (
            <Pagination
              value={page}
              onChange={setPage}
              total={totalPages}
              size="sm"
              color="teal"
              boundaries={1}
              siblings={1}
            />
          )}
        </Group>
      )}
    </Box>
  );
}
