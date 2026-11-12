import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, layout, radius, spacing } from '@/constants/theme';
import { useProducts } from '@/hooks/use-products';
import { usePosStore } from '@/stores/pos-store';
import { useSessionStore } from '@/stores/session-store';
import type { ProductStock } from '@/types/domain';
import { formatCurrency } from '@/utils/format';

type ProductCatalogProps = {
  availableWidth: number;
};

export function ProductCatalog({ availableWidth }: ProductCatalogProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const outlet = useSessionStore((state) => state.outlet);
  const addProduct = usePosStore((state) => state.addProduct);
  const limit = 24;
  const columns = useMemo(() => {
    if (availableWidth >= 1000) return 4;
    if (availableWidth >= 700) return 3;
    if (availableWidth >= 440) return 2;
    return 1;
  }, [availableWidth]);
  const query = useProducts({
    outletId: outlet?.id,
    search,
    page,
    limit,
  });
  const products = query.data?.products ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((query.data?.totalCount ?? 0) / limit),
  );

  const renderProduct = ({ item }: { item: ProductStock }) => {
    const disabled = item.quantity <= 0 || item.finalPrice <= 0;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Tambah ${item.product.name} ke keranjang`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => addProduct(item)}
        style={({ pressed }) => [
          styles.productCard,
          { width: `${100 / columns}%` },
          pressed && styles.productCardPressed,
          disabled && styles.disabled,
        ]}
      >
        <Text numberOfLines={2} style={styles.productName}>
          {item.product.name.trim()}
        </Text>
        <Text numberOfLines={1} style={styles.barcode}>
          {item.product.barcode || item.product.sku || 'Tanpa barcode'}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.price}>{formatCurrency(item.finalPrice)}</Text>
          <Text style={styles.stock}>Stok {item.quantity}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.title}>Produk</Text>
          <Text style={styles.subtitle}>
            {outlet?.name ?? 'Pilih outlet setelah login'}
          </Text>
        </View>
        {query.data && (
          <Text style={styles.source}>
            {query.data.source === 'local' ? 'Data perangkat' : 'Data server'}
          </Text>
        )}
      </View>

      <Text style={styles.inputLabel}>Cari nama, barcode, atau SKU</Text>
      <TextInput
        accessibilityLabel="Cari nama, barcode, atau SKU"
        autoCapitalize="none"
        onChangeText={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Ketik pencarian"
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        style={styles.searchInput}
        value={search}
      />

      {query.isPending ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateText}>Memuat produk dari perangkat...</Text>
        </View>
      ) : query.isError ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorTitle}>Produk tidak dapat dimuat</Text>
          <Text style={styles.stateText}>{query.error.message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => query.refetch()}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.primaryPressed,
            ]}
          >
            <Text style={styles.retryText}>Coba lagi</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={
            products.length === 0 ? styles.emptyList : styles.productList
          }
          data={products}
          key={`product-grid-${columns}`}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.stateContainer}>
              <Text style={styles.emptyTitle}>Belum ada produk tersimpan</Text>
              <Text style={styles.stateText}>
                Hubungkan internet dan login ke outlet untuk mengunduh katalog.
              </Text>
            </View>
          }
          numColumns={columns}
          renderItem={renderProduct}
        />
      )}

      <View style={styles.pagination}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: page <= 1 }}
          disabled={page <= 1}
          onPress={() => setPage((current) => Math.max(1, current - 1))}
          style={({ pressed }) => [
            styles.pageButton,
            pressed && styles.pageButtonPressed,
            page <= 1 && styles.disabled,
          ]}
        >
          <Text style={styles.pageButtonText}>Sebelumnya</Text>
        </Pressable>
        <Text style={styles.pageText}>
          {page} / {totalPages}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: page >= totalPages }}
          disabled={page >= totalPages}
          onPress={() => setPage((current) => current + 1)}
          style={({ pressed }) => [
            styles.pageButton,
            pressed && styles.pageButtonPressed,
            page >= totalPages && styles.disabled,
          ]}
        >
          <Text style={styles.pageButtonText}>Berikutnya</Text>
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
  source: {
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.control,
    fontSize: 12,
    fontWeight: '700',
  },
  inputLabel: { color: colors.text, fontSize: 13, fontWeight: '600' },
  searchInput: {
    minHeight: layout.minTapTarget,
    borderColor: colors.textMuted,
    borderWidth: 1,
    borderRadius: radius.control,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  productList: { paddingBottom: spacing.sm },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  productCard: {
    minHeight: 116,
    padding: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
    gap: spacing.sm,
    transform: [{ scale: 0.98 }],
  },
  productCardPressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  productName: { color: colors.text, fontWeight: '700', fontSize: 15 },
  barcode: { color: colors.textMuted, fontSize: 12 },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  price: { color: colors.primary, fontSize: 14, fontWeight: '700', flex: 1 },
  stock: { color: colors.textMuted, fontSize: 12 },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  stateText: { color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  errorTitle: { color: colors.danger, fontSize: 17, fontWeight: '700' },
  retryButton: {
    minHeight: layout.minTapTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.control,
  },
  retryText: { color: colors.surface, fontWeight: '700' },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  pageButton: {
    minHeight: layout.minTapTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radius.control,
  },
  pageButtonPressed: { backgroundColor: colors.primarySoft },
  pageButtonText: { color: colors.primary, fontWeight: '700' },
  pageText: { color: colors.text, minWidth: 48, textAlign: 'center' },
  disabled: { opacity: 0.45 },
});
