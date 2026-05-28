import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, StatusBar, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import COLORS from '../../themes/colors';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'AlertaEstoque'>;

const API_BASE_URL = 'http://SEU_IP:3000';

interface ItemEstoque {
  idProduto: number;
  nomeProduto: string;
  quantidade: number;
  qtdMin: number;
  qtdMax: number;
  categoria: string;
}

function getStatus(qtd: number, min: number) {
  if (qtd <= min) return 'critical';
  return 'low';
}

export default function AlertaEstoque() {
  const navigation = useNavigation<NavigationProps>();
  const [itens, setItens]     = useState<ItemEstoque[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlertas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/produtos`);
      const data: ItemEstoque[] = await res.json();
      // filtra só os que estão no limite: qtd <= qtdMin * 1.5
      const alertas = data.filter(p => p.quantidade <= p.qtdMin * 1.5);
      setItens(alertas);
    } catch {
      setItens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAlertas(); }, [fetchAlertas]));

  function renderItem({ item }: { item: ItemEstoque }) {
    const status = getStatus(item.quantidade, item.qtdMin);
    const isCritical = status === 'critical';

    return (
      <View style={styles.card}>
        <View style={[styles.badge, isCritical ? styles.badgeCritical : styles.badgeLow]}>
          <Text style={[styles.badgeText, { color: isCritical ? COLORS.red : '#854F0B' }]}>
            {isCritical ? 'Crítico' : 'Baixo'}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.nomeProduto}</Text>
        <Text style={styles.cardSub}>{item.categoria}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardInfo}>Atual: <Text style={[styles.cardInfoVal, isCritical && { color: COLORS.red }]}>{item.quantidade}</Text></Text>
          <Text style={styles.cardInfo}>Mínimo: <Text style={styles.cardInfoVal}>{item.qtdMin}</Text></Text>
          <Text style={styles.cardInfo}>Máximo: <Text style={styles.cardInfoVal}>{item.qtdMax}</Text></Text>
        </View>
        <View style={styles.barWrap}>
          <View style={[
            styles.bar,
            {
              width: `${Math.min((item.quantidade / item.qtdMax) * 100, 100)}%` as any,
              backgroundColor: isCritical ? COLORS.red : '#EF9F27',
            }
          ]} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.c1} />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Alerta de Estoque</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.count}>
          {loading ? '...' : `${itens.length} produto(s) com estoque baixo`}
        </Text>

        {loading ? (
          <ActivityIndicator color={COLORS.c3} style={{ marginTop: 40 }} />
        ) : itens.length === 0 ? (
          <Text style={styles.empty}>Nenhum produto com estoque baixo.</Text>
        ) : (
          <FlatList
            data={itens}
            keyExtractor={item => String(item.idProduto)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.c1 },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backIcon:    { color: COLORS.white, fontSize: 24 },
  topbarTitle: { color: COLORS.white, fontSize: 17, fontWeight: '600' },

  body:        { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  count:       { fontSize: 11, color: COLORS.c3, marginBottom: 12 },
  empty:       { color: '#999', fontSize: 13, textAlign: 'center', marginTop: 40 },

  card: {
    backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.2)', padding: 12,
  },
  badge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 99, marginBottom: 8,
  },
  badgeCritical: { backgroundColor: '#fdecea' },
  badgeLow:      { backgroundColor: '#fff3e0' },
  badgeText:     { fontSize: 11, fontWeight: '600' },
  cardTitle:     { fontSize: 14, fontWeight: '500', color: COLORS.c1 },
  cardSub:       { fontSize: 12, color: '#888', marginTop: 2, marginBottom: 8 },
  cardRow:       { flexDirection: 'row', gap: 16, marginBottom: 8 },
  cardInfo:      { fontSize: 12, color: '#777' },
  cardInfoVal:   { fontWeight: '600', color: COLORS.c1 },
  barWrap:       { backgroundColor: '#e8eeee', borderRadius: 4, height: 4 },
  bar:           { height: 4, borderRadius: 4 },
});