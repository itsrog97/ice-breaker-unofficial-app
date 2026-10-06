import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, Container, ErrorView, LoadingView } from '@/components';
import { ProfileSections } from '@/components/ProfileSections';
import { WEB_BASE_URL } from '@/constants/config';
import { useMe } from '@/hooks/queries';
import { spacing, useTheme } from '@/theme';
import { fullName } from '@/utils/format';

export default function MyProfileScreen() {
  const { colors } = useTheme();
  const me = useMe();

  if (me.isPending) return <LoadingView />;
  if (me.isError) return <ErrorView error={me.error} onRetry={() => me.refetch()} />;
  const p = me.data;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing.xxxl }}
      refreshControl={<RefreshControl refreshing={me.isRefetching} onRefresh={() => me.refetch()} />}
    >
      <Container style={styles.pad}>
        <View style={styles.hero}>
          <Avatar uri={p.photo_url} person={p} size={140} bordered />
          <AppText variant="display" align="center" accessibilityRole="header">
            {fullName(p)}
          </AppText>
          {p.my_icebreaker ? (
            <AppText tone="secondary" italic align="center">
              “{p.my_icebreaker}”
            </AppText>
          ) : null}
          <Button
            title="Edit Profile"
            variant="outline"
            size="sm"
            icon="open-outline"
            onPress={() => WebBrowser.openBrowserAsync(`${WEB_BASE_URL}/profile`)}
            accessibilityLabel="Edit profile on the Icebreaker website"
            style={{ marginTop: spacing.sm }}
          />
          <AppText variant="caption" tone="tertiary" align="center">
            Profile editing opens the website in this test build.
          </AppText>
        </View>
        <ProfileSections
          own
          data={{
            schoolName: p.school_info?.alias || p.school_info?.name,
            gradYear: p.mba_grad_year,
            experiences: p.experiences,
            industry: p.current_industry,
            projects: p.my_projects || p.project_brief,
            city: p.city_display_name || p.city,
            hometown: p.hometown_display_name,
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
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
});
