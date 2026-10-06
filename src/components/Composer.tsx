import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { fontFamily, radius, spacing, touchTarget, useTheme } from '@/theme';

export interface ComposerProps {
  placeholder: string;
  onSend: (text: string) => Promise<unknown> | void;
  sending?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

/** Message input + round send button. Clears on successful send; keeps text on failure. */
export function Composer({ placeholder, onSend, sending, disabled, maxLength = 4000 }: ComposerProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0 && !sending && !disabled;

  const submit = async () => {
    if (!canSend) return;
    const value = text.trim();
    try {
      await onSend(value);
      setText('');
    } catch {
      // Caller surfaces the error; keep the draft so nothing is lost.
    }
  };

  return (
    <View style={[styles.row, { borderTopColor: colors.borderPrimary, backgroundColor: colors.surfacePrimary }]}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline
        maxLength={maxLength}
        editable={!disabled}
        accessibilityLabel={placeholder}
        style={[
          styles.input,
          { color: colors.textPrimary, borderColor: colors.borderSecondary, backgroundColor: colors.surfacePrimary },
        ]}
      />
      <Pressable
        onPress={submit}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        accessibilityState={{ disabled: !canSend }}
        style={[styles.send, { backgroundColor: canSend ? colors.brandBlue : colors.surfaceTertiary }]}
      >
        {sending ? (
          <ActivityIndicator color={colors.onBrand} />
        ) : (
          <Ionicons name="arrow-up" size={22} color={canSend ? colors.onBrand : colors.textTertiary} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: touchTarget,
    maxHeight: 140,
    borderWidth: 1.5,
    borderRadius: radius.xl + 6,
    paddingHorizontal: spacing.lg,
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: 16,
    fontFamily: fontFamily.regular,
  },
  send: { width: touchTarget, height: touchTarget, borderRadius: touchTarget / 2, alignItems: 'center', justifyContent: 'center' },
});
