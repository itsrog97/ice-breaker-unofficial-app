import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily, radius, spacing, touchTarget, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectSheetProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selected: string[];
  multiple?: boolean;
  searchable?: boolean;
  onClose: () => void;
  onApply: (values: string[]) => void;
}

/** Bottom sheet for picking one or many options (mobile replacement for the web dropdowns). */
export function SelectSheet({ visible, title, options, selected, multiple = true, searchable, onClose, onApply }: SelectSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<string[]>(selected);
  const [query, setQuery] = useState('');

  const reset = () => {
    setDraft(selected);
    setQuery('');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const toggle = (v: string) => {
    if (!multiple) {
      onApply([v]);
      onClose();
      return;
    }
    setDraft((d) => (d.includes(v) ? d.filter((x) => x !== v) : [...d, v]));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={reset} statusBarTranslucent>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} accessibilityLabel="Close" />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.surfacePrimary, paddingBottom: insets.bottom + spacing.md },
        ]}
        accessibilityViewIsModal
      >
        <View style={[styles.grabber, { backgroundColor: colors.borderSecondary }]} />
        <View style={styles.header}>
          <AppText variant="title" style={{ flex: 1 }} accessibilityRole="header">
            {title}
          </AppText>
          {multiple && draft.length > 0 ? (
            <Button title="Clear" variant="ghost" size="sm" onPress={() => setDraft([])} />
          ) : null}
        </View>
        {searchable ? (
          <View style={[styles.search, { borderColor: colors.borderPrimary, backgroundColor: colors.inputBackground }]}>
            <Ionicons name="search" size={18} color={colors.textTertiary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${title.toLowerCase()}`}
              placeholderTextColor={colors.textTertiary}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              accessibilityLabel={`Search ${title}`}
            />
          </View>
        ) : null}
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.value}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={20}
          renderItem={({ item }) => {
            const on = draft.includes(item.value) || (!multiple && selected.includes(item.value));
            return (
              <Pressable
                onPress={() => toggle(item.value)}
                accessibilityRole={multiple ? 'checkbox' : 'radio'}
                accessibilityState={{ checked: on }}
                style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.surfaceSecondary }]}
              >
                <AppText style={{ flex: 1 }}>{item.label}</AppText>
                <Ionicons
                  name={on ? (multiple ? 'checkbox' : 'radio-button-on') : multiple ? 'square-outline' : 'radio-button-off'}
                  size={22}
                  color={on ? colors.brandBlue : colors.textTertiary}
                />
              </Pressable>
            );
          }}
        />
        {multiple ? (
          <Button
            title={draft.length ? `Apply (${draft.length})` : 'Apply'}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
            style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm }}
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: StyleSheet.absoluteFill,
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '80%',
    borderTopLeftRadius: radius.xl + 6,
    borderTopRightRadius: radius.xl + 6,
    paddingTop: spacing.sm,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchInput: { flex: 1, fontSize: 16, fontFamily: fontFamily.regular },
  list: { flexGrow: 0 },
  item: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
