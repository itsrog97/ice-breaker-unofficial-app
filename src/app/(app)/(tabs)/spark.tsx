import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, Card, Composer, LoadingView } from '@/components';
import { useSpark, type SparkBlock } from '@/hooks/useSpark';
import { maxContentWidth, radius, spacing, useTheme } from '@/theme';

const str = (v: unknown) => (typeof v === 'string' ? v : undefined);

/** Best-effort rendering of Spark's structured cards (profile suggestions, drafted openers, …). */
function SparkCard({ event, data }: { event: string; data: Record<string, unknown> }) {
  const { colors } = useTheme();
  const profile = (data.profile as Record<string, unknown> | undefined) ?? data;
  const personId = str(profile.profile_id) ?? str(profile.user_id) ?? str(data.target_user_id) ?? str(profile.id);
  const first = str(profile.first_name) ?? str(profile.name)?.split(' ')[0];
  const last = str(profile.last_name) ?? '';
  const subtitle = [str(profile.current_title), str(profile.current_company)].filter(Boolean).join(' at ');
  const body =
    str(data.message) ?? str(data.draft) ?? str(data.text) ?? str(data.summary) ?? str(data.why) ?? str(data.reason) ?? str(data.content);

  const title: Record<string, string> = {
    profile_card: 'Someone worth meeting',
    icebreaker: 'Drafted opener',
    message_sent: 'Message sent',
    imagined_conversation: 'How the conversation might go',
    goal_summary: 'Your goals',
    resume_feedback: 'Resume feedback',
    document_intake: 'Document received',
  };

  return (
    <Card style={styles.card}>
      <AppText variant="overline" tone="brand">
        {title[event] ?? 'Spark'}
      </AppText>
      {first ? (
        <View style={styles.person}>
          <Avatar uri={str(profile.photo_url)} person={{ first_name: first, last_name: last }} size={44} />
          <View style={{ flex: 1 }}>
            <AppText variant="heading" numberOfLines={1}>
              {[first, last].filter(Boolean).join(' ')}
            </AppText>
            {subtitle ? (
              <AppText variant="caption" tone="secondary" numberOfLines={2}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </View>
      ) : null}
      {body ? <AppText style={{ color: colors.textPrimary }}>{body}</AppText> : null}
      {personId ? (
        <Button
          title="View profile"
          variant="outline"
          size="sm"
          onPress={() => router.push({ pathname: '/person/[id]', params: { id: personId } })}
          style={{ alignSelf: 'flex-start' }}
        />
      ) : null}
    </Card>
  );
}

export default function SparkScreen() {
  const { colors } = useTheme();
  const { blocks, streaming, activity, error, loadingHistory, send, retry } = useSpark();
  const listRef = useRef<FlatList<SparkBlock>>(null);

  useEffect(() => {
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [blocks, activity]);

  if (loadingHistory) return <LoadingView label="Starting Spark…" />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <FlatList
        ref={listRef}
        data={blocks}
        keyExtractor={(b) => b.id}
        style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          <View style={{ gap: spacing.md }}>
            {activity ? (
              <View style={styles.activity} accessibilityLiveRegion="polite">
                <ActivityIndicator size="small" color={colors.brandBlue} />
                <AppText variant="caption" tone="secondary">
                  {activity}
                </AppText>
              </View>
            ) : null}
            {error ? (
              <View style={styles.errorBox} accessibilityRole="alert">
                <AppText tone="error">{error}</AppText>
                <Button title="Retry" size="sm" variant="outline" onPress={retry} disabled={streaming} />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          switch (item.kind) {
            case 'user':
              return (
                <View style={[styles.userBubble, { backgroundColor: colors.bubbleMine }]}>
                  <AppText color={colors.onBubbleMine} selectable>
                    {item.text}
                  </AppText>
                </View>
              );
            case 'assistant':
              return (
                <AppText style={styles.assistant} selectable>
                  {item.text}
                </AppText>
              );
            case 'suggestions':
              return (
                <View style={styles.chips}>
                  {item.chips.map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => send(c.send_text || c.label)}
                      disabled={streaming}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.chip,
                        { borderColor: colors.brandBlue },
                        pressed && { backgroundColor: colors.surfaceSecondary },
                      ]}
                    >
                      <AppText variant="label" tone="brand">
                        {c.label}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              );
            case 'card':
              return <SparkCard event={item.event} data={item.data} />;
          }
        }}
      />
      <Composer placeholder="Message Spark" onSend={(t) => send(t)} sending={streaming} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  assistant: { fontSize: 16, lineHeight: 26 },
  userBubble: { alignSelf: 'flex-end', maxWidth: '85%', borderRadius: radius.xl + 4, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, minHeight: 40, justifyContent: 'center' },
  activity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  errorBox: { gap: spacing.sm, alignItems: 'flex-start' },
  card: { gap: spacing.md },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
