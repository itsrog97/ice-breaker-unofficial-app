import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi } from '@/api/endpoints';
import { AppText, Button, IconButton, TextField, errorMessage } from '@/components';
import { spacing, useTheme } from '@/theme';
import { isValidEmail } from '@/utils/format';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'sent'>('idle');

  const submit = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setState('loading');
    try {
      await authApi.forgotPassword(email.trim());
      setState('sent');
    } catch (e) {
      setError(errorMessage(e));
      setState('idle');
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.top}>
        <IconButton icon="arrow-back" label="Back to sign in" onPress={() => router.back()} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.inner}>
            <AppText variant="display" align="center" accessibilityRole="header">
              Reset Password
            </AppText>
            {state === 'sent' ? (
              <>
                <AppText tone="secondary" align="center" style={styles.sub}>
                  If an account exists for {email.trim()}, you’ll receive a link to reset your password shortly.
                </AppText>
                <Button title="Back to Sign In" onPress={() => router.back()} fullWidth />
              </>
            ) : (
              <>
                <AppText tone="secondary" align="center" style={styles.sub}>
                  Enter your email and we’ll send you{'\n'}a link to reset your password
                </AppText>
                <View style={{ gap: spacing.lg }}>
                  <TextField
                    label="Email Address"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    returnKeyType="send"
                    onSubmitEditing={submit}
                    error={error}
                  />
                  <Button title="Send Reset Link" onPress={submit} loading={state === 'loading'} fullWidth />
                  <Button title="Back to Sign In" variant="ghost" size="sm" onPress={() => router.back()} style={{ alignSelf: 'center' }} />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { paddingHorizontal: spacing.sm },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  inner: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  sub: { marginTop: spacing.sm, marginBottom: spacing.xl },
});
