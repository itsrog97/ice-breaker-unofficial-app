import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import { Avatar } from './Avatar';
import { AppText } from './AppText';

export interface ProfileTileProps {
  firstName: string;
  photoUrl?: string | null;
  school?: string | null;
  company?: string | null;
  isNew?: boolean | null;
  isActive?: boolean | null;
  width: number;
  onPress: () => void;
}

/** Circular avatar + name/school/company tile used in Discover grid and Home carousels. */
export function ProfileTile({ firstName, photoUrl, school, company, isNew, isActive, width, onPress }: ProfileTileProps) {
  const size = Math.min(width - spacing.lg, 112);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[firstName, school, company].filter(Boolean).join(', ')}
      style={({ pressed }) => [styles.tile, { width }, pressed && { opacity: 0.75 }]}
    >
      <Avatar uri={photoUrl} person={{ first_name: firstName }} size={size} online={isActive} isNew={isNew} bordered />
      <View style={styles.text}>
        <AppText variant="label" numberOfLines={1} align="center" style={{ fontWeight: '700' }}>
          {firstName}
        </AppText>
        {school ? (
          <AppText variant="caption" tone="brand" numberOfLines={1} align="center">
            {school}
          </AppText>
        ) : null}
        {company ? (
          <AppText variant="caption" tone="secondary" numberOfLines={1} align="center">
            {company}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', paddingVertical: spacing.sm },
  text: { marginTop: spacing.sm, alignSelf: 'stretch', paddingHorizontal: spacing.xs },
});
