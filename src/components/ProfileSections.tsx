import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useProfileOptions } from '@/hooks/queries';
import { radius, spacing, useTheme } from '@/theme';
import type { Experience, Option } from '@/types/api';
import { labelFor } from '@/utils/format';
import { AppText } from './AppText';
import { Divider, Overline } from './Layout';

export interface ProfileSectionData {
  schoolName?: string | null;
  gradYear?: number | null;
  undergrad?: string | null;
  experiences?: Experience[] | null;
  industry?: string | null;
  projects?: string | null;
  city?: string | null;
  hometown?: string | null;
  whatBringsYou?: string[] | null;
  passionateAbout?: string[] | null;
  excitedCities?: string[] | null;
  helpOthers?: string[] | null;
  affinityTags?: string[] | null;
  hobbies?: string[] | null;
}

function Tags({ values, options }: { values: string[]; options?: Option[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.tags}>
      {values.map((v) => (
        <View key={v} style={[styles.tag, { borderColor: colors.borderPrimary, backgroundColor: colors.surfaceSecondary }]}>
          <AppText variant="caption">{labelFor(v, options)}</AppText>
        </View>
      ))}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Divider />
      <View style={styles.section}>
        <Overline>{title}</Overline>
        <View style={{ gap: spacing.sm }}>{children}</View>
      </View>
    </View>
  );
}

/** Read-only profile body shared by "My Profile" and other people's profiles. */
export function ProfileSections({ data, own }: { data: ProfileSectionData; own?: boolean }) {
  const options = useProfileOptions().data;
  const exps = [...(data.experiences ?? [])].sort((a, b) => a.display_order - b.display_order);
  const has = (v?: unknown[] | null) => !!v && v.length > 0;
  const emptyHint = (text: string) =>
    own ? (
      <AppText tone="tertiary" italic>
        {text}
      </AppText>
    ) : null;

  return (
    <View>
      {data.schoolName || data.undergrad ? (
        <Section title="Education">
          {data.schoolName ? (
            <View>
              <AppText variant="bodyMedium">{data.schoolName}</AppText>
              {data.gradYear ? (
                <AppText variant="caption" tone="secondary">
                  MBA ’{String(data.gradYear).slice(-2)}
                </AppText>
              ) : null}
            </View>
          ) : null}
          {data.undergrad ? <AppText>{data.undergrad}</AppText> : null}
        </Section>
      ) : null}

      {exps.length ? (
        <Section title="Work Experience">
          {exps.map((e) => (
            <View key={e.id}>
              <AppText variant="bodyMedium">
                {e.title}
                {e.is_current ? (
                  <AppText variant="caption" tone="brand">
                    {'  '}Current
                  </AppText>
                ) : null}
              </AppText>
              <AppText variant="caption" tone="secondary">
                {[e.company, [e.start_year, e.end_year].filter(Boolean).join('–')].filter(Boolean).join(' · ')}
              </AppText>
            </View>
          ))}
          {data.industry ? <Tags values={[data.industry]} /> : null}
        </Section>
      ) : null}

      {data.projects || own ? (
        <Section title="Activities & Projects">
          {data.projects ? <AppText>{data.projects}</AppText> : emptyHint("Share what you're working on")}
        </Section>
      ) : null}

      {data.city || data.hometown ? (
        <Section title="Location">
          {data.city ? (
            <AppText>
              {data.city}{' '}
              <AppText variant="caption" tone="secondary">
                Current
              </AppText>
            </AppText>
          ) : null}
          {data.hometown ? (
            <AppText>
              {data.hometown}{' '}
              <AppText variant="caption" tone="secondary">
                Hometown
              </AppText>
            </AppText>
          ) : null}
        </Section>
      ) : null}

      {has(data.whatBringsYou) ? (
        <Section title={own ? 'What brings me here' : 'What brings them here'}>
          <Tags values={data.whatBringsYou!} options={options?.what_brings_you_options} />
        </Section>
      ) : null}
      {has(data.passionateAbout) ? (
        <Section title={own ? "I'm passionate about" : 'Passionate about'}>
          <Tags values={data.passionateAbout!} options={options?.passionate_about_options} />
        </Section>
      ) : null}
      {has(data.excitedCities) ? (
        <Section title={own ? "I'm interested in working in" : 'Interested in working in'}>
          <Tags values={data.excitedCities!} options={options?.excited_city_options} />
        </Section>
      ) : null}
      {has(data.helpOthers) ? (
        <Section title={own ? 'Reach out to me about' : 'Reach out to them about'}>
          <Tags values={data.helpOthers!} options={options?.help_others_options} />
        </Section>
      ) : null}
      {has(data.affinityTags) ? (
        <Section title={own ? "What's shaped my experience" : "What's shaped their experience"}>
          <Tags values={data.affinityTags!} options={options?.affinity_tag_options} />
        </Section>
      ) : null}
      {has(data.hobbies) || own ? (
        <Section title={own ? 'My hobbies' : 'Hobbies'}>
          {has(data.hobbies) ? <Tags values={data.hobbies!} options={options?.hobbies} /> : emptyHint('Add your hobbies')}
        </Section>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingVertical: spacing.lg, gap: spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
});
