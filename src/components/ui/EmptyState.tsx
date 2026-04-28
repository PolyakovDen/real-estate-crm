import { Stack, Text, Button } from '@mantine/core';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <Stack align="center" py={48} gap="xs">
      <Text size="sm" fw={500}>{title}</Text>
      {description && (
        <Text size="sm" c="dimmed">{description}</Text>
      )}
      {actionLabel && actionHref && (
        <Button component={Link} href={actionHref} variant="light" color="teal" size="xs" mt="xs">
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}
