import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, layout, radius, spacing } from '@/constants/theme';
import { usePosStore } from '@/stores/pos-store';
import type { CartItem } from '@/types/domain';
import { formatCurrency } from '@/utils/format';

export function CartPanel() {
  const cart = usePosStore((state) => state.cart);
  const selectedMember = usePosStore((state) => state.selectedMember);
  const changeQuantity = usePosStore((state) => state.changeQuantity);
  const removeProduct = usePosStore((state) => state.removeProduct);
  const holdTransaction = usePosStore((state) => state.holdTransaction);
  const cancelTransaction = usePosStore((state) => state.cancelTransaction);
  const total = cart.reduce((sum, item) => sum + item.total, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const confirmCancel = () => {
    Alert.alert(
      'Batalkan transaksi?',
      'Keranjang dan member yang dipilih akan dikosongkan.',
      [
        { text: 'Kembali', style: 'cancel' },
        {
          text: 'Batalkan transaksi',
          style: 'destructive',
          onPress: cancelTransaction,
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text numberOfLines={2} style={styles.itemName}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          {formatCurrency(item.unitPrice)} per item
        </Text>
      </View>
      <View style={styles.quantityRow}>
        <Pressable
          accessibilityLabel={`Kurangi jumlah ${item.name}`}
          accessibilityRole="button"
          onPress={() => changeQuantity(item.productStockId, -1)}
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && styles.controlPressed,
          ]}
        >
          <Text style={styles.quantityButtonText}>−</Text>
        </Pressable>
        <Text accessibilityLabel={`Jumlah ${item.quantity}`} style={styles.quantity}>
          {item.quantity}
        </Text>
        <Pressable
          accessibilityLabel={`Tambah jumlah ${item.name}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: item.quantity >= item.maxQuantity }}
          disabled={item.quantity >= item.maxQuantity}
          onPress={() => changeQuantity(item.productStockId, 1)}
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && styles.controlPressed,
            item.quantity >= item.maxQuantity && styles.disabled,
          ]}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`Hapus ${item.name} dari keranjang`}
          accessibilityRole="button"
          onPress={() => removeProduct(item.productStockId)}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.removePressed,
          ]}
        >
          <Text style={styles.removeText}>Hapus</Text>
        </Pressable>
      </View>
      <Text style={styles.lineTotal}>{formatCurrency(item.total)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.title}>Keranjang</Text>
          <Text style={styles.subtitle}>{itemCount} item</Text>
        </View>
        {selectedMember && (
          <Text style={styles.memberText}>{selectedMember.name}</Text>
        )}
      </View>

      <FlatList
        contentContainerStyle={cart.length === 0 ? styles.emptyList : undefined}
        data={cart}
        keyExtractor={(item) => item.productStockId}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Keranjang masih kosong</Text>
            <Text style={styles.emptyText}>
              Pilih produk dari katalog untuk memulai transaksi.
            </Text>
          </View>
        }
        renderItem={renderItem}
      />

      <View style={styles.summary}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Jumlah bayar</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
        <View style={styles.secondaryActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: cart.length === 0 }}
            disabled={cart.length === 0}
            onPress={holdTransaction}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.controlPressed,
              cart.length === 0 && styles.disabled,
            ]}
          >
            <Text style={styles.secondaryText}>Hold</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: cart.length === 0 }}
            disabled={cart.length === 0}
            onPress={confirmCancel}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.removePressed,
              cart.length === 0 && styles.disabled,
            ]}
          >
            <Text style={styles.cancelText}>Batalkan</Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          disabled
          style={[styles.payButton, styles.disabled]}
        >
          <Text style={styles.payText}>Pembayaran: tahap berikutnya</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.panel,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  memberText: {
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.control,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontWeight: '700',
  },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  emptyText: { color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  cartItem: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  itemInfo: { gap: spacing.xs },
  itemName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  itemPrice: { color: colors.textMuted, fontSize: 12 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  quantityButton: {
    width: layout.minTapTarget,
    height: layout.minTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.textMuted,
    borderWidth: 1,
    borderRadius: radius.control,
  },
  quantityButtonText: { color: colors.text, fontSize: 20, fontWeight: '700' },
  quantity: { color: colors.text, minWidth: 28, textAlign: 'center', fontWeight: '700' },
  removeButton: {
    minHeight: layout.minTapTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginLeft: 'auto',
  },
  removeText: { color: colors.danger, fontWeight: '700' },
  lineTotal: { color: colors.text, textAlign: 'right', fontWeight: '700' },
  summary: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totalLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  totalValue: { color: colors.primary, fontSize: 21, fontWeight: '800' },
  secondaryActions: { flexDirection: 'row', gap: spacing.sm },
  secondaryButton: {
    flex: 1,
    minHeight: layout.minTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radius.control,
  },
  secondaryText: { color: colors.primary, fontWeight: '700' },
  cancelButton: {
    flex: 1,
    minHeight: layout.minTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radius.control,
  },
  cancelText: { color: colors.danger, fontWeight: '700' },
  payButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    backgroundColor: colors.primary,
  },
  payText: { color: colors.surface, fontWeight: '800' },
  controlPressed: { backgroundColor: colors.primarySoft },
  removePressed: { backgroundColor: colors.dangerSoft },
  disabled: { opacity: 0.45 },
});
