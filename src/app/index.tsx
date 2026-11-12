import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartPanel } from '@/components/cart-panel';
import { ConnectivityBanner } from '@/components/connectivity-banner';
import { ProductCatalog } from '@/components/product-catalog';
import { colors, layout, spacing } from '@/constants/theme';
import { useSessionStore } from '@/stores/session-store';

export default function PosScreen() {
  const { width, height } = useWindowDimensions();
  const isSplit = width >= layout.splitMinWidth && width > height;
  const user = useSessionStore((state) => state.user);
  const outlet = useSessionStore((state) => state.outlet);
  const catalogWidth = isSplit ? width * 0.64 : width - spacing.xl * 2;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Kurio POS</Text>
            <Text style={styles.context}>
              {outlet?.name ?? 'Belum login'}
              {user?.name ? ` · ${user.name}` : ''}
            </Text>
          </View>
          <Text style={styles.orientationLabel}>
            {isSplit ? 'Mode landscape' : 'Mode portrait'}
          </Text>
        </View>

        <ConnectivityBanner />

        <View style={[styles.workspace, isSplit ? styles.split : styles.stacked]}>
          <View style={isSplit ? styles.catalogSplit : styles.catalogStacked}>
            <ProductCatalog availableWidth={catalogWidth} />
          </View>
          <View style={isSplit ? styles.cartSplit : styles.cartStacked}>
            <CartPanel />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  brand: { color: colors.text, fontSize: 24, fontWeight: '800' },
  context: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  orientationLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  workspace: { flex: 1, minHeight: 0, gap: spacing.md },
  split: { flexDirection: 'row' },
  stacked: { flexDirection: 'column' },
  catalogSplit: { flex: 1.8, minWidth: 0 },
  cartSplit: { flex: 1, minWidth: 320 },
  catalogStacked: { flex: 1.2, minHeight: 0 },
  cartStacked: { flex: 1, minHeight: 280 },
});
