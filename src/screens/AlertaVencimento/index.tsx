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

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'AlertaVencimento'>;

const API_BASE_URL = 'http://SEU_IP:3000';

interface Produto {
  idProduto: number;
  nomeProduto: string;
  dataVencimento: string;
  categoria: string;
  fornecedor: string;
}

function diasParaVencer(dataStr: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(dataStr);
  venc.setHours(0, 0, 0, 0);
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function getAlerta(dias: number): 'critico' | 'atencao' | null {
  if (dias <= 45) return 'critico';
  if (dias <= 90) return 'atencao';
  return null;
}

function formatData(dataStr: string): string {
  const d = new Date(dataStr);
  return d.toLocaleDateString('pt-BR');
}

export default function AlertaVencimento() {
  const navigation = useNavigation<NavigationProps>();
  const [itens, setItens]     = useState<(Produto & { dias: number })[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlertas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/produtos`);
      const data: Produto[] = await res.json();
      const alertas = data
        .map(p => ({ ...p, dias: diasParaVencer(p.dataVencimento) }))
        .filter(p => p.dias <= 90)
        .sort((a, b) => a.dias - b.dias);
      setItens(alertas);
    } catch {
      setItens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAlertas(); }, [fetchAlertas]));

  function renderItem({ item }: { item: Produto & { dias: number } }) {
    const alerta = getAlerta(item.dias);
    const isCritico = alerta === 'critico';

    return (
      <View style={styles.card}>
        <View style={[styles.badge, isCritico ? styles.badgeCritico : styles.badgeAtencao]}>
          <Text style={[styles.badgeText, { color: isCritico ? COLORS.red : '#854F0B' }]}>
            {isCritico ? `${item.dias}d — Crítico` : `${item.dias}d — Atenção`}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.nomeProduto}</Text>
        <Text style={styles.cardSub}>{item.categoria}  ·  {item.fornecedor}</Text>
        <Text style={styles.cardDate}>Vence em: {formatData(item.dataVencimento)}</Text>
      </View>
    );
  }

  const criticos  = itens.filter(i => i.dias <= 45).length;
  const atencao   = itens.filter(i => i.dias > 45 && i.dias <= 90).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.c1} />

      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Alerta de Vencimento</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {!loading && itens.length > 0 && (
          <View style={styles.resumo}>
            <View style={styles.resumoCard}>
              <Text style={styles.resumoVal}>{criticos}</Text>
              <Text style={styles.resumoLabel}>Até 45 dias</Text>
            </View>
            <View style={styles.resumoCard}>
              <Text style={[styles.resumoVal, { color: '#854F0B' }]}>{atencao}</Text>
              <Text style={styles.resumoLabel}>Até 90 dias</Text>
            </View>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={COLORS.c3} style={{ marginTop: 40 }} />
        ) : itens.length === 0 ? (
          <Text style={styles.empty}>Nenhum produto próximo do vencimento.</Text>
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
  empty:       { color: '#999', fontSize: 13, textAlign: 'center', marginTop: 40 },

  resumo:      { flexDirection: 'row', gap: 10, marginBottom: 14 },
  resumoCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.2)',
    padding: 12, alignItems: 'center',
  },
  resumoVal:   { fontSize: 24, fontWeight: '600', color: COLORS.red },
  resumoLabel: { fontSize: 11, color: '#888', marginTop: 2 },

  card: {
    backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.2)', padding: 12,
  },
  badge:        { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, marginBottom: 8 },
  badgeCritico: { backgroundColor: '#fdecea' },
  badgeAtencao: { backgroundColor: '#fff3e0' },
  badgeText:    { fontSize: 11, fontWeight: '600' },
  cardTitle:    { fontSize: 14, fontWeight: '500', color: COLORS.c1 },
  cardSub:      { fontSize: 12, color: '#888', marginTop: 2 },
  cardDate:     { fontSize: 12, color: COLORS.c3, marginTop: 6, fontWeight: '500' },
});