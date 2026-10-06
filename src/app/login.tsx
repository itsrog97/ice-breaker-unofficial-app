import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { AppText, Button, Logo, TextField } from '@/components';
import { DEMO_MODE, LINKS } from '@/constants/config';
import { useAuth } from '@/store/AuthProvider';
import { spacing, useTheme } from '@/theme';
import { isValidEmail } from '@/utils/format';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn, expiredNotice, dismissExpiredNotice } = useAuth();
  const [email, setEmail] = useState(DEMO_MODE ? 'alex.morgan@example.com' : '');
  const [password, setPassword] = useState(DEMO_MODE ? 'demo1234' : '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const submit = async () => {
    if (loading) return;
    setFormError(null);
    dismissExpiredNotice();
    const eErr = !email.trim()
      ? 'Please enter your email.'
      : !isValidEmail(email)
        ? 'Please enter a valid email address.'
        : null;
    const pErr = !password ? 'Please enter your password.' : null;
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation happens automatically via the protected route guard.
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setFormError('Invalid email and/or password. Please try again.');
      } else if (e instanceof ApiError) {
        setFormError(e.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.inner}>
            <View style={styles.logo}>
              <Logo height={40} />
            </View>
            <AppText variant="display" align="center" accessibilityRole="header">
              Welcome Back
            </AppText>
            <AppText tone="secondary" align="center" style={styles.sub}>
              Sign in to continue networking{'\n'}with your MBA community
            </AppText>

            {DEMO_MODE ? (
              <View style={[styles.notice, { backgroundColor: colors.surfaceSecondary, borderColor: colors.brandBlue, borderWidth: 1 }]}>
                <AppText variant="label" tone="brand">Demo mode</AppText>
                <AppText variant="caption" tone="secondary">
                  Fictional people and messages, no real account needed. Tap Sign In (any email and password work).
                </AppText>
              </View>
            ) : null}
            {expiredNotice ? (
              <View style={[styles.notice, { backgroundColor: colors.contextBg }]} accessibilityRole="alert">
                <AppText variant="caption" color={colors.contextText}>
                  Your session expired. Please sign in again.
                </AppText>
              </View>
            ) : null}

            <View style={styles.form}>
              <TextField
                testID="email"
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailError) setEmailError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={emailError}
              />
              <TextField
                testID="password"
                ref={passwordRef}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (passwordError) setPasswordError(null);
                }}
                secureToggle
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submit}
                error={passwordError}
              />
              {formError ? (
                <AppText tone="error" align="center" accessibilityLiveRegion="polite" accessibilityRole="alert">
                  {formError}
                </AppText>
              ) : null}
              <Button testID="sign-in" title="Sign In" onPress={submit} loading={loading} fullWidth />
            </View>

            <View style={styles.row}>
              <AppText tone="secondary">Don’t have an account?</AppText>
              <Button
                title="Sign Up"
                variant="ghost"
                size="sm"
                onPress={() => WebBrowser.openBrowserAsync(LINKS.signup)}
                accessibilityLabel="Sign up on the Icebreaker website"
              />
            </View>
            <Link href="/forgot-password" asChild>
              <Button title="Forgot Password?" variant="ghost" size="sm" style={styles.center} />
            </Link>
            <AppText variant="caption" tone="tertiary" align="center" style={styles.disclaimer}>
              Unofficial client. Not affiliated with or endorsed by Icebreaker Connect, Inc.{'\n'}Sign in with your existing Icebreaker account.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  inner: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  logo: { alignItems: 'center', marginBottom: spacing.xxl },
  sub: { marginTop: spacing.sm, marginBottom: spacing.xl },
  form: { gap: spacing.lg },
  notice: { padding: spacing.md, borderRadius: 10, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, gap: spacing.xs },
  center: { alignSelf: 'center' },
  disclaimer: { marginTop: spacing.xl },
});
