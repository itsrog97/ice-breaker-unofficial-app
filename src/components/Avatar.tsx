import { Image } from 'expo-image';
import React from 'react';
import { PixelRatio, StyleSheet, View } from 'react-native';

import { fontFamily, useTheme } from '@/theme';
import { cloudinaryThumb, initials } from '@/utils/format';
import { AppText } from './AppText';

export interface AvatarProps {
  uri?: string | null;
  person?: { first_name?: string | null; last_name?: string | null };
  size?: number;
  online?: boolean | null;
  isNew?: boolean | null;
  bordered?: boolean;
}

export function Avatar({ uri, person, size = 48, online, isNew, bordered }: AvatarProps) {
  const { colors } = useTheme();
  const src = cloudinaryThumb(uri, size * Math.min(PixelRatio.get(), 3));
  const dot = Math.max(10, size * 0.13);

  return (
    <View style={{ width: size, height: size }} accessibilityIgnoresInvertColors>
      {src ? (
        <Image
          source={{ uri: src }}
          style={[
            { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceTertiary },
            bordered && { borderWidth: 2, borderColor: colors.borderPrimary },
          ]}
          contentFit="cover"
          transition={150}
          recyclingKey={src}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceTertiary },
          ]}
        >
          <AppText style={{ fontFamily: fontFamily.semibold, fontSize: size * 0.36 }} tone="secondary">
            {initials(person)}
          </AppText>
        </View>
      )}
      {online ? (
        <View
          accessibilityLabel="Active recently"
          style={[
            styles.dot,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: colors.success,
              borderColor: colors.surfacePrimary,
              right: size * 0.04,
              bottom: size * 0.04,
            },
          ]}
        />
      ) : null}
      {isNew ? (
        <View style={[styles.newPill, { backgroundColor: colors.brandBlue }]}>
          <AppText variant="micro" color={colors.onBrand}>
            NEW
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', borderWidth: 2 },
  newPill: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 999,
  },
});
