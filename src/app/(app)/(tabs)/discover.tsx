import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import {
  AppText,
  Chip,
  EmptyView,
  ErrorView,
  LoadingView,
  ProfileTile,
  SelectSheet,
  useResponsive,
  type SelectOption,
} from '@/components';
import { useDiscover, useProfileOptions, useSchools } from '@/hooks/queries';
import { fontFamily, radius, spacing, useTheme } from '@/theme';
import type { DiscoveryFilters } from '@/types/api';

type FilterKey = 'industries' | 'passionate_about' | 'schools' | 'what_brings_you' | 'help_others';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'industries', label: 'Industry' },
  { key: 'passionate_about', label: 'Areas of Interest' },
  { key: 'schools', label: 'School' },
  { key: 'what_brings_you', label: 'Goals' },
  { key: 'help_others', label: 'Advice They Can Give' },
];

const SORTS: SelectOption[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'recent', label: 'Newest' },
];

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const { width } = useResponsive();
  const [query, setQuery] = useState('');
  const q = useDebounced(query, 350);
  const [selected, setSelected] = useState<Record<FilterKey, string[]>>({
    industries: [],
    passionate_about: [],
    schools: [],
    what_brings_you: [],
    help_others: [],
  });
  const [sort, setSort] = useState('relevance');
  const [openSheet, setOpenSheet] = useState<FilterKey | 'sort' | null>(null);

  const options = useProfileOptions();
  const schools = useSchools(openSheet === 'schools' || selected.schools.length > 0);

  const optionMap: Record<FilterKey, SelectOption[]> = useMemo(
    () => ({
      industries: options.data?.industries ?? [],
      passionate_about: options.data?.passionate_about_options ?? [],
      what_brings_you: options.data?.what_brings_you_options ?? [],
      help_others: options.data?.help_others_options ?? [],
      schools: (schools.data ?? []).map((s) => ({ value: String(s.id), label: s.name })),
    }),
    [options.data, schools.data],
  );

  const filters: DiscoveryFilters = useMemo(
    () => ({
      q,
      industries: selected.industries,
      passionate_about: selected.passionate_about,
      what_brings_you: selected.what_brings_you,
      help_others: selected.help_others,
      schools: selected.schools.map(Number),
      sort_by: sort === 'relevance' ? undefined : sort,
    }),
    [q, selected, sort],
  );

  const search = useDiscover(filters);
  const profiles = useMemo(() => search.data?.pages.flatMap((p) => p.profiles) ?? [], [search.data]);
  const total = search.data?.pages[0]?.total_count;
  const activeCount = Object.values(selected).filter((v) => v.length).length;

  const columns = width >= 1024 ? 6 : width >= 600 ? 4 : 3;
  const tileWidth = (Math.min(width, 1100) - spacing.sm * 2) / columns;

  const header = (
    <View style={{ backgroundColor: colors.background }}>
      <View style={[styles.search, { borderColor: colors.borderPrimary, backgroundColor: colors.surfaceSecondary }]}>
        <Ionicons name="search" size={18} color={colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search people, companies..."
          placeholderTextColor={colors.textTertiary}
          style={[styles.searchInput, { color: colors.textPrimary }]}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search people and companies"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={selected[f.key].length ? `${f.label} · ${selected[f.key].length}` : f.label}
            selected={selected[f.key].length > 0}
            trailingIcon="chevron-down"
            onPress={() => setOpenSheet(f.key)}
          />
        ))}
        {activeCount ? (
          <Chip
            label="Clear all"
            icon="close"
            onPress={() => setSelected({ industries: [], passionate_about: [], schools: [], what_brings_you: [], help_others: [] })}
          />
        ) : null}
      </ScrollView>
      <View style={styles.sortRow}>
        <AppText variant="caption" tone="secondary" style={{ flex: 1 }}>
          {total != null ? `${total.toLocaleString()} people` : ''}
        </AppText>
        <Pressable
          onPress={() => setOpenSheet('sort')}
          accessibilityRole="button"
          accessibilityLabel={`Sort by ${SORTS.find((s) => s.value === sort)?.label}`}
          style={styles.sortBtn}
          hitSlop={8}
        >
          <AppText variant="caption" tone="secondary">
            Sort by:{' '}
          </AppText>
          <AppText variant="label">{SORTS.find((s) => s.value === sort)?.label}</AppText>
          <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );

  let body: React.ReactNode = null;
  if (search.isPending) body = <LoadingView />;
  else if (search.isError) body = <ErrorView error={search.error} onRetry={() => search.refetch()} />;
  else if (!profiles.length)
    body = (
      <EmptyView
        icon="search-outline"
        title="No people found"
        message="Try a different search or remove some filters."
      />
    );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        key={columns}
        data={body ? [] : profiles}
        numColumns={columns}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={header}
        ListEmptyComponent={body as React.ReactElement}
        stickyHeaderIndices={[0]}
        contentContainerStyle={[styles.list, { maxWidth: 1100 }]}
        style={{ alignSelf: 'center', width: '100%', maxWidth: 1100 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={search.isRefetching && !search.isFetchingNextPage} onRefresh={() => search.refetch()} />}
        onEndReachedThreshold={0.6}
        onEndReached={() => search.hasNextPage && !search.isFetchingNextPage && search.fetchNextPage()}
        ListFooterComponent={search.isFetchingNextPage ? <ActivityIndicator style={{ margin: spacing.xl }} color={colors.brandBlue} /> : null}
        renderItem={({ item }) => (
          <ProfileTile
            width={tileWidth}
            firstName={item.first_name}
            photoUrl={item.photo_url}
            school={item.mba_school_alias || item.mba_school_name}
            company={item.current_company}
            isNew={item.is_new}
            isActive={item.is_active}
            onPress={() => router.push({ pathname: '/person/[id]', params: { id: item.id } })}
          />
        )}
      />
      <SelectSheet
        visible={!!openSheet && openSheet !== 'sort'}
        title={FILTERS.find((f) => f.key === openSheet)?.label ?? ''}
        options={openSheet && openSheet !== 'sort' ? optionMap[openSheet] : []}
        selected={openSheet && openSheet !== 'sort' ? selected[openSheet] : []}
        searchable={openSheet === 'schools' || openSheet === 'industries'}
        onClose={() => setOpenSheet(null)}
        onApply={(v) => openSheet && openSheet !== 'sort' && setSelected((s) => ({ ...s, [openSheet]: v }))}
      />
      <SelectSheet
        visible={openSheet === 'sort'}
        title="Sort by"
        multiple={false}
        options={SORTS}
        selected={[sort]}
        onClose={() => setOpenSheet(null)}
        onApply={(v) => setSort(v[0] ?? 'relevance')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.sm, paddingBottom: spacing.xxl },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 16, fontFamily: fontFamily.regular, paddingVertical: spacing.sm },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.md },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 36 },
});
