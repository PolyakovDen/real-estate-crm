'use client';

import { useState } from 'react';
import { Box, Group, Text, Modal, ActionIcon, Stack } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight, IconX, IconPhoto } from '@tabler/icons-react';
import type { PropertyPhoto } from '@/types/property';

interface PhotoGalleryProps {
  photos: PropertyPhoto[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const sorted = [...photos].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return a.sort_order - b.sort_order;
  });

  const [lightboxOpen, { open: openLightbox, close: closeLightbox }] = useDisclosure(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useMediaQuery('(max-width: 48em)');

  if (sorted.length === 0) {
    return (
      <Box
        className="property-card-placeholder"
        style={{
          height: isMobile ? 100 : 180,
          borderRadius: 'var(--mantine-radius-sm)',
          border: '1px solid var(--mantine-color-default-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconPhoto size={isMobile ? 22 : 28} color="var(--mantine-color-gray-3)" stroke={1.5} />
      </Box>
    );
  }

  const mainPhoto = sorted[activeIndex] ?? sorted[0];

  const handleOpenLightbox = (index: number) => {
    setActiveIndex(index);
    openLightbox();
  };

  const goNext = () => setActiveIndex((i) => (i + 1) % sorted.length);
  const goPrev = () => setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length);

  return (
    <>
      <Stack gap="xs">
        {/* Main photo */}
        <Box
          role="button"
          tabIndex={0}
          aria-label={`Відкрити фото ${activeIndex + 1} з ${sorted.length}`}
          onClick={() => handleOpenLightbox(activeIndex)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenLightbox(activeIndex);
            }
          }}
          style={{
            height: isMobile ? 200 : 320,
            borderRadius: 'var(--mantine-radius-sm)',
            overflow: 'hidden',
            cursor: 'pointer',
            backgroundImage: `url(${mainPhoto.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 4,
              padding: '2px 8px',
            }}
          >
            <Text size="xs" c="white">{activeIndex + 1} / {sorted.length}</Text>
          </Box>
        </Box>

        {/* Thumbnail strip */}
        {sorted.length > 1 && (
          <Group
            gap={4}
            wrap="nowrap"
            style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}
          >
            {sorted.map((photo, i) => (
              <Box
                key={photo.id}
                role="button"
                tabIndex={0}
                aria-label={`Фото ${i + 1}`}
                aria-current={i === activeIndex ? 'true' : undefined}
                onClick={() => setActiveIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveIndex(i);
                  }
                }}
                style={{
                  width: isMobile ? 48 : 64,
                  height: isMobile ? 36 : 48,
                  flexShrink: 0,
                  borderRadius: 'var(--mantine-radius-sm)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundImage: `url(${photo.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: i === activeIndex
                    ? '2px solid var(--mantine-color-teal-6)'
                    : '1px solid var(--mantine-color-default-border)',
                  opacity: i === activeIndex ? 1 : 0.7,
                  transition: 'opacity 100ms ease',
                }}
              />
            ))}
          </Group>
        )}
      </Stack>

      {/* Lightbox modal */}
      <Modal
        opened={lightboxOpen}
        onClose={closeLightbox}
        fullScreen
        withCloseButton={false}
        padding={0}
        styles={{
          body: {
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          },
          content: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={closeLightbox}
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
        >
          <IconX size={20} color="white" />
        </ActionIcon>

        {sorted.length > 1 && (
          <>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="xl"
              onClick={goPrev}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
            >
              <IconChevronLeft size={28} color="white" />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="xl"
              onClick={goNext}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
            >
              <IconChevronRight size={28} color="white" />
            </ActionIcon>
          </>
        )}

        <Box
          style={{
            maxWidth: '90vw',
            maxHeight: '85vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sorted[activeIndex]?.url}
            alt=""
            style={{
              maxWidth: '100%',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: 'var(--mantine-radius-sm)',
            }}
          />
        </Box>

        <Text size="sm" c="white" mt="sm" ta="center">
          {activeIndex + 1} / {sorted.length}
        </Text>
      </Modal>
    </>
  );
}
