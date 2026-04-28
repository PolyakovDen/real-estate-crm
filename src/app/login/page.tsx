'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput, PasswordInput, Button, Paper, Title, Text,
  Stack, Anchor, Alert, Box, Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconHome2 } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: { email: '', password: '', fullName: '' },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Невірний email'),
      password: (v) => (v.length >= 6 ? null : 'Мінімум 6 символів'),
      fullName: (v) => {
        if (!isRegister) return null;
        return v.length >= 2 ? null : 'Мінімум 2 символи';
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { data: { full_name: values.fullName } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
      }
      router.push('/properties');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Виникла помилка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Brand panel */}
      <Box
        visibleFrom="sm"
        style={{
          width: 420,
          flexShrink: 0,
          backgroundColor: 'var(--mantine-color-dark-8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 48,
        }}
      >
        <Group gap="xs">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'var(--mantine-color-teal-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconHome2 size={18} color="white" />
          </Box>
          <Text size="sm" fw={700} c="white">RE CRM</Text>
        </Group>

        <Box>
          <Text
            c="white"
            fw={600}
            style={{ fontSize: '2rem', lineHeight: 1.2, letterSpacing: '-0.03em' }}
          >
            Нерухомість
            <br />
            під контролем.
          </Text>
          <Text c="dark.2" size="sm" mt="lg" maw={300} style={{ lineHeight: 1.6 }}>
            Управляйте об&apos;єктами, слідкуйте за цінами, закривайте угоди швидше.
          </Text>
        </Box>

        <Text c="dark.4" size="xs">&copy; {new Date().getFullYear()} RE CRM</Text>
      </Box>

      {/* Form */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Box style={{ width: '100%', maxWidth: 380 }}>
          <Box hiddenFrom="sm" mb="xl">
            <Group gap="xs">
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'var(--mantine-color-teal-6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconHome2 size={18} color="white" />
              </Box>
              <Text size="sm" fw={700}>RE CRM</Text>
            </Group>
          </Box>

          <Title order={2} mb={4}>
            {isRegister ? 'Створити акаунт' : 'Вхід'}
          </Title>
          <Text c="dimmed" size="sm" mb="xl">
            {isRegister ? 'Заповніть дані для реєстрації' : 'Введіть email і пароль'}
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" radius="md">
                  {error}
                </Alert>
              )}

              {isRegister && (
                <TextInput
                  label="Повне ім'я"
                  placeholder="Іван Петренко"
                  required
                  {...form.getInputProps('fullName')}
                />
              )}

              <TextInput
                label="Email"
                placeholder="you@example.com"
                required
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Пароль"
                placeholder="Ваш пароль"
                required
                {...form.getInputProps('password')}
              />

              <Button type="submit" fullWidth loading={isLoading} color="teal">
                {isRegister ? 'Зареєструватись' : 'Увійти'}
              </Button>
            </Stack>
          </form>

          <Text c="dimmed" size="sm" ta="center" mt="xl">
            {isRegister ? 'Вже є акаунт? ' : 'Немає акаунту? '}
            <Anchor
              component="button"
              type="button"
              size="sm"
              c="teal"
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
            >
              {isRegister ? 'Увійти' : 'Зареєструватись'}
            </Anchor>
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
