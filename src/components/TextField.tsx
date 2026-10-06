import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { fontFamily, radius, spacing, touchTarget, useTheme } from '@/theme';
import { AppText } from './AppText';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  secureToggle?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, secureToggle, leftIcon, secureTextEntry, style, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.error : focused ? colors.brandBlue : colors.borderPrimary,
          },
        ]}
      >
        {leftIcon ? <Ionicons name={leftIcon} size={18} color={colors.textTertiary} /> : null}
        <TextInput
          {...rest}
          ref={ref}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          accessibilityLabel={rest.accessibilityLabel ?? label}
          style={[styles.input, { color: colors.textPrimary }, style]}
        />
        {secureToggle ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={10}
            style={styles.eye}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" tone="error" style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: {},
  field: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  input: { flex: 1, fontSize: 16, fontFamily: fontFamily.regular, paddingVertical: spacing.md },
  eye: { minWidth: touchTarget - 16, alignItems: 'flex-end' },
  error: {},
});
