import NetInfo from '@react-native-community/netinfo';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { DEMO_MODE } from '@/constants/config';
import { fontFamily, spacing, useTheme } from '@/theme';
import { AppText } from './AppText';

const icon = require('../../assets/app-icon.png');

/**
 * App wordmark: original icon + "Connectoo" set in Inter + an "UNOFFICIAL" tag.
 * Connectoo is an independent client for the Icebreaker network and uses none of Icebreaker's artwork.
 */
export function Logo({ height = 30 }: { height?: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.logo} accessible accessibilityRole="image" accessibilityLabel="Connectoo (unofficial)">
      <Image source={icon} style={{ width: height, height, borderRadius: height * 0.24 }} contentFit="cover" />
      <AppText style={{ fontFamily: fontFamily.bold, fontSize: height * 0.66, lineHeight: height * 0.8, color: colors.brandNavyText }}>
        connectoo
      </AppText>
      <View style={[styles.tag, { borderColor: colors.brandBlue }]}>
        <AppText style={{ fontFamily: fontFamily.semibold, fontSize: Math.max(8, height * 0.28), letterSpacing: 0.6, color: colors.brandBlue }}>
          UNOFFICIAL
        </AppText>
      </View>
    </View>
  );
}

/** Strip shown in the public web demo so viewers know the data is fictional. */
export function DemoBanner() {
  const { colors } = useTheme();
  if (!DEMO_MODE) return null;
  return (
    <View style={[styles.banner, { backgroundColor: colors.surfaceSecondary }]}>
      <AppText variant="caption" tone="brand" align="center">
        Demo mode · fictional data · changes reset when you reload
      </AppText>
    </View>
  );
}

/** Thin banner shown while the device has no connectivity. */
export function OfflineBanner() {
  const { colors } = useTheme();
  const [offline, setOffline] = useState(false);
  useEffect(
    () =>
      NetInfo.addEventListener((s) => {
        if (DEMO_MODE) return;
        setOffline(s.isConnected === false || (Platform.OS !== 'web' && s.isInternetReachable === false));
      }),
    [],
  );
  if (!offline) return null;
  return (
    <View style={[styles.banner, { backgroundColor: colors.warning }]} accessibilityRole="alert">
      <AppText variant="caption" color="#1a1300" align="center">
        You’re offline. Showing saved data where available.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  banner: { paddingVertical: spacing.xs, paddingHorizontal: spacing.lg },
});
