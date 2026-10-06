import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import { authApi } from '@/api/endpoints';
import { AppText, Button, Container, TextField, errorMessage } from '@/components';
import { useAuth } from '@/store/AuthProvider';
import { spacing, useTheme } from '@/theme';
import { notify } from '@/utils/dialog';
import { PASSWORD_RULES, validatePasswordChange } from '@/utils/validation';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const { signIn, signOut } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const v = validatePasswordChange(current, next, confirm);
    setError(v);
    if (v) return;
    setLoading(true);
    try {
      const { email } = await authApi.me();
      await authApi.changePassword(current, next);
      // Like the website, re-authenticate with the new password so the session stays valid.
      try {
        await signIn(email, next);
      } catch {
        notify('Password changed', 'Please sign in again with your new password.');
        await signOut();
        return;
      }
      notify('Password changed', 'Your password has been updated.');
      router.back();
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? 'Current password is incorrect.' : errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg }}>
        <Container style={styles.form}>
          <AppText tone="secondary">Enter your current password and choose a new one.</AppText>
          <TextField label="Current Password" value={current} onChangeText={setCurrent} secureToggle autoCapitalize="none" autoComplete="current-password" />
          <TextField label="New Password" value={next} onChangeText={setNext} secureToggle autoCapitalize="none" autoComplete="new-password" />
          <TextField label="Confirm New Password" value={confirm} onChangeText={setConfirm} secureToggle autoCapitalize="none" autoComplete="new-password" onSubmitEditing={submit} />
          <View style={{ gap: 4 }}>
            {PASSWORD_RULES.map((r) => (
              <AppText key={r.id} variant="caption" tone={r.test(next) ? 'success' : 'tertiary'}>
                {r.test(next) ? '✓' : '•'} {r.label}
              </AppText>
            ))}
          </View>
          {error ? (
            <AppText tone="error" accessibilityRole="alert">
              {error}
            </AppText>
          ) : null}
          <View>
            <Button title="Change Password" onPress={submit} loading={loading} fullWidth />
          </View>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
});
