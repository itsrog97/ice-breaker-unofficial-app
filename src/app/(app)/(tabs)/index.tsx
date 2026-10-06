import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import {
  AppText,
  Avatar,
  Card,
  Container,
  EmptyView,
  ErrorView,
  LoadingView,
  ProfileTile,
  SectionHeader,
  useResponsive,
} from '@/components';
import { useHome } from '@/hooks/queries';
import { radius, spacing, useTheme } from '@/theme';
import type { Carousel, CarouselProfileCard, FeaturedProfile } from '@/types/api';
import { labelFor, schoolYear, titleAtCompany } from '@/utils/format';

const openProfile = (id: string) => router.push({ pathname: '/person/[id]', params: { id } });

function FeaturedCard({ p }: { p: FeaturedProfile }) {
  const { colors } = useTheme();
  const name = [p.first_name, p.last_name].filter((s) => s && s !== '.').join(' ');
  return (
    <Card onPress={() => openProfile(p.profile_id)} accessibilityLabel={`Match of the day: ${name}`} style={styles.featured}>
      <Avatar uri={p.photo_url} person={p} size={96} bordered online={p.is_active} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="overline" tone="brand">
          MATCH OF THE DAY
        </AppText>
        <AppText variant="title" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={2}>
          {titleAtCompany(p.current_title, p.current_company)}
        </AppText>
        <AppText variant="label">{schoolYear(p.school_alias, p.mba_grad_year)}</AppText>
        {p.shared_context?.length ? (
          <View style={styles.contextRow}>
            {p.shared_context.slice(0, 3).map((c) => (
              <View key={c} style={[styles.contextPill, { borderColor: colors.brandBlue }]}>
                <AppText variant="caption" tone="brand">
                  {c}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Card>
  );
}

function PersonRow({ d }: { d: CarouselProfileCard }) {
  return (
    <View style={styles.personRow}>
      <Avatar uri={d.photo_url} person={d} size={40} />
      <View style={{ flex: 1 }}>
        <AppText variant="label" numberOfLines={1}>
          {[d.first_name, d.last_name].join(' ')}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={1}>
          {schoolYear(d.school_alias, d.mba_grad_year)}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={1}>
          {d.current_company}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#8c9094" />
    </View>
  );
}

function StoryCard({ d, kind, width }: { d: CarouselProfileCard; kind: 'project' | 'notable_icebreaker'; width: number }) {
  const { colors } = useTheme();
  const text = kind === 'project' ? d.project_brief : d.icebreaker_brief;
  return (
    <Card
      onPress={() => openProfile(d.profile_id)}
      accessibilityLabel={`${text}. ${d.first_name} ${d.last_name}`}
      style={[styles.storyCard, { width }]}
    >
      {kind === 'project' && d.project_category ? (
        <View style={[styles.categoryChip, { backgroundColor: colors.projectChipBg }]}>
          <AppText variant="caption" color={colors.projectChipText}>
            {labelFor(d.project_category)}
          </AppText>
        </View>
      ) : null}
      <AppText variant="title" numberOfLines={4} style={{ flex: 1 }}>
        {text}
      </AppText>
      <View style={[styles.sep, { backgroundColor: colors.borderPrimary }]} />
      <PersonRow d={d} />
    </Card>
  );
}

function CarouselSection({ c, width }: { c: Carousel; width: number }) {
  const cards = c.cards ?? [];
  if (!cards.length) return null;
  const isStory = c.primary_card_type === 'project' || c.primary_card_type === 'notable_icebreaker';
  const storyWidth = Math.min(width * 0.78, 320);
  const tileWidth = width >= 600 ? 140 : 124;
  return (
    <View style={styles.section}>
      <Container style={styles.pad}>
        <SectionHeader title={c.title} subtitle={c.subtitle} />
      </Container>
      <FlatList
        horizontal
        data={cards}
        keyExtractor={(card) => card.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
        ItemSeparatorComponent={() => <View style={{ width: isStory ? spacing.md : 0 }} />}
        snapToInterval={isStory ? storyWidth + spacing.md : undefined}
        decelerationRate={isStory ? 'fast' : 'normal'}
        renderItem={({ item }) =>
          isStory ? (
            <StoryCard d={item.data} kind={c.primary_card_type as 'project' | 'notable_icebreaker'} width={storyWidth} />
          ) : (
            <ProfileTile
              width={tileWidth}
              firstName={item.data.first_name}
              photoUrl={item.data.photo_url}
              school={item.data.school_alias}
              company={item.data.current_company}
              isNew={item.data.is_new}
              isActive={item.data.is_active}
              onPress={() => openProfile(item.data.profile_id)}
            />
          )
        }
      />
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useResponsive();
  const home = useHome();
  const onRefresh = useCallback(() => home.refetch(), [home]);

  if (home.isPending) return <LoadingView label="Finding people for you…" />;
  if (home.isError) return <ErrorView error={home.error} onRetry={onRefresh} />;

  const carousels = (home.data.carousels ?? []).filter((c) => c.cards?.length);
  if (!carousels.length && !home.data.featured_profile) {
    return <EmptyView icon="people-outline" title="Nothing here yet" message="Check back soon for new people to meet." />;
  }

  return (
    <FlatList
      data={carousels}
      keyExtractor={(c) => c.id}
      refreshControl={<RefreshControl refreshing={home.isRefetching} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      ListHeaderComponent={
        home.data.featured_profile ? (
          <Container style={[styles.pad, { paddingTop: spacing.lg }]}>
            <FeaturedCard p={home.data.featured_profile} />
          </Container>
        ) : null
      }
      renderItem={({ item }) => <CarouselSection c={item} width={Math.min(width, 1100)} />}
      initialNumToRender={4}
      windowSize={7}
    />
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: spacing.lg },
  featured: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg },
  contextRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  contextPill: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 2 },
  section: { marginTop: spacing.xl },
  hList: { paddingHorizontal: spacing.lg },
  storyCard: { minHeight: 220, gap: spacing.md },
  categoryChip: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  sep: { height: StyleSheet.hairlineWidth },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
