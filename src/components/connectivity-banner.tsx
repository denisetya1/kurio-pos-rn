import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { useConnectivityStore } from '@/stores/connectivity-store';

export function ConnectivityBanner() {
  const isOnline = useConnectivityStore((state) => state.isOnline);
  const pendingSyncCount = useConnectivityStore(
    (state) => state.pendingSyncCount,
  );

  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <View
      accessibilityRole="text"
      style={[styles.container, isOnline ? styles.pending : styles.offline]}
    >
      <Text style={styles.text}>
        {isOnline
          ? `${pendingSyncCount} transaksi menunggu sinkronisasi`
          : 'Mode offline aktif. Data dan transaksi tetap disimpan di perangkat.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  offline: {
    backgroundColor: colors.warningSoft,
  },
  pending: {
    backgroundColor: colors.primarySoft,
  },
  text: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
