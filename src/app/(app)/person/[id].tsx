import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { homeApi } from '@/api/endpoints';
import {
  AppText,
  Avatar,
  Button,
  Card,
  Container,
  ErrorView,
  LoadingView,
  errorMessage,
} from '@/components';
import { ProfileSections } from '@/components/ProfileSections';
import { useCommonalities, useProfileDetail, useStartConversation, useToggleSaved } from '@/hooks/queries';
import { shadows, spacing, useTheme } from '@/theme';
import { fullName } from '@/utils/format';
import { notify } from '@/utils/dialog';

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfileDetail(id);
  const common = useCommonalities(id);
  const saved = useQuery({ queryKey: ['home', 'saved'], queryFn: homeApi.savedProfiles, staleTime: 30_000 });
  const start = useStartConversation();
  const toggleSaved = useToggleSaved();
  const [savedOverride, setIsSaved] = useState<boolean | null>(null);
  const [showAllReasons, setShowAllReasons] = useState(false);

  const savedList = (saved.data?.profiles ?? []) as { id?: string; profile_id?: string }[];
  const isSaved = savedOverride ?? savedList.some((sp) => sp.id === id || sp.profile_id === id);

  if (profile.isPending) return <LoadingView />;
  if (profile.isError) return <ErrorView error={profile.error} onRetry={() => profile.refetch()} />;

  const p = profile.data;
  const name = fullName(p);
  const reasons = common.data?.reasons_to_connect ?? [];
  const visibleReasons = showAllReasons ? reasons : reasons.slice(0, 3);

  const burnTheWall = async () => {
    try {
      const convo = await start.mutateAsync(p.id);
      router.push({ pathname: '/conversation/[id]', params: { id: convo.id } });
    } catch (e) {
      notify("Couldn't start a conversation", errorMessage(e));
    }
  };

  const onSave = async () => {
    const was = isSaved;
    setIsSaved(!was);
    try {
      await toggleSaved.mutateAsync({ id: p.id, saved: was });
      saved.refetch();
    } catch (e) {
      setIsSaved(was);
      notify("Couldn't update saved profiles", errorMessage(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <Container style={styles.pad}>
          <View style={styles.hero}>
            <Avatar uri={p.photo_url} person={p} size={140} online={p.is_active} bordered />
            <AppText variant="display" align="center" accessibilityRole="header">
              {name}
            </AppText>
            {p.current_title || p.current_company ? (
              <AppText tone="secondary" align="center">
                {[p.current_title, p.current_company].filter(Boolean).join(' at ')}
              </AppText>
            ) : null}
            {p.my_icebreaker ? (
              <AppText tone="secondary" italic align="center" style={{ marginTop: spacing.xs }}>
                “{p.my_icebreaker}”
              </AppText>
            ) : null}
          </View>

          {reasons.length ? (
            <Card style={styles.reasons}>
              <AppText variant="heading" align="center">
                Reach out to {p.first_name} to:
              </AppText>
              {visibleReasons.map((r, i) => (
                <View key={`${r.type}-${i}`} style={styles.reason}>
                  <View style={[styles.bullet, { backgroundColor: colors.brandBlue }]} />
                  <AppText tone="secondary" style={{ flex: 1 }}>
                    {r.text}
                  </AppText>
                </View>
              ))}
              {reasons.length > 3 ? (
                <Pressable onPress={() => setShowAllReasons((s) => !s)} accessibilityRole="button" hitSlop={8}>
                  <AppText variant="label" tone="brand">
                    {showAllReasons ? 'Show less' : `+${reasons.length - 3} more reasons to connect`}
                  </AppText>
                </Pressable>
              ) : null}
            </Card>
          ) : null}

          {common.data?.commonalities?.length ? (
            <View style={styles.common}>
              <AppText variant="overline" tone="secondary">
                IN COMMON
              </AppText>
              {common.data.commonalities.map((c) => (
                <AppText key={c.category} variant="caption">
                  <AppText variant="caption" tone="secondary">
                    {c.label}:{' '}
                  </AppText>
                  {c.items.join(', ')}
                </AppText>
              ))}
            </View>
          ) : null}

          <ProfileSections
            data={{
              schoolName: p.mba_school_name,
              gradYear: p.mba_grad_year,
              undergrad: p.undergrad_school,
              experiences: p.experiences,
              industry: p.current_industry,
              projects: p.my_projects,
              city: p.city,
              hometown: p.hometown,
              whatBringsYou: p.what_brings_you,
              passionateAbout: p.passionate_about,
              excitedCities: p.excited_cities,
              helpOthers: p.help_others,
              affinityTags: p.affinity_tags,
              hobbies: p.hobbies,
            }}
          />
        </Container>
      </ScrollView>

      <View
        style={[
          styles.actions,
          shadows.heavy,
          { backgroundColor: colors.surfacePrimary, borderTopColor: colors.borderPrimary, paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <Container style={styles.actionRow}>
          <Button
            title={isSaved ? 'Saved' : 'Save'}
            icon={isSaved ? 'bookmark' : 'bookmark-outline'}
            variant="secondary"
            onPress={onSave}
            style={{ flex: 1, paddingHorizontal: spacing.md }}
            accessibilityLabel={isSaved ? 'Remove from saved' : 'Save for later'}
          />
          <Button
            title={p.has_messaged ? 'Message' : 'Burn the Wall'}
            icon={p.has_messaged ? 'chatbubble-ellipses-outline' : 'flame'}
            variant={p.has_messaged ? 'primary' : 'fire'}
            onPress={burnTheWall}
            loading={start.isPending}
            disabled={p.can_message === false}
            style={{ flex: 1.6, paddingHorizontal: spacing.md }}
          />
        </Container>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  reasons: { gap: spacing.md, marginBottom: spacing.lg },
  reason: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  common: { gap: spacing.xs, marginBottom: spacing.lg },
  actions: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: spacing.md },
  actionRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg },
});
