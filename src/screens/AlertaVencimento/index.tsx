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
import { api } from '../../../api/api';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'AlertaVencimento'>;

// ✅ Campos reais da tabela Alerta no banco
interface Alerta {
  idAlerta:        number;
  tipo:            string;     // ex: 'VENCIMENTO'
  idProduto:       number;
  mensagem:        string;
  dataGeracao:     string;
  foiVisualizado:  boolean;
}

function formatData(dataStr: string): string {
  return new Date(dataStr).toLocaleDateString('pt-BR');
}

export default function AlertaVencimento() {
  const navigation = useNavigation<NavigationProps>();

  const [itens, setItens]     = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(false);

  // ─── GET /alertas  →  array de Alerta[] ─────────────────────────────────────
  // Filtra apenas alertas de tipo VENCIMENTO no front
  const fetchAlertas = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Alerta[]>('/alertas');
      const vencimentos = data.filter(a =>
        a.tipo?.toUpperCase().includes('VENCIMENTO')
      );
      setItens(vencimentos);
    } catch (error) {
      console.error('Erro ao buscar alertas de vencimento:', error);
      setItens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAlertas(); }, [fetchAlertas]));

  function renderItem({ item }: { item: Alerta }) {
    const isCritico = !item.foiVisualizado;   // não visualizado = mais urgente visualmente

    return (
      <View style={styles.card}>
        <View style={[styles.badge, isCritico ? styles.badgeCritico : styles.badgeAtencao]}>
          <Text style={[styles.badgeText, { color: isCritico ? COLORS.red : '#854F0B' }]}>
            {isCritico ? 'Não visualizado' : 'Visualizado'}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>Produto ID: {item.idProduto}</Text>
        <Text style={styles.cardSub}>{item.mensagem}</Text>
        <Text style={styles.cardDate}>Gerado em: {formatData(item.dataGeracao)}</Text>
      </View>
    );
  }

  const naoVisualizados = itens.filter(i => !i.foiVisualizado).length;
  const visualizados    = itens.filter(i =>  i.foiVisualizado).length;

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
              <Text style={styles.resumoVal}>{naoVisualizados}</Text>
              <Text style={styles.resumoLabel}>Não vistos</Text>
            </View>
            <View style={styles.resumoCard}>
              <Text style={[styles.resumoVal, { color: '#854F0B' }]}>{visualizados}</Text>
              <Text style={styles.resumoLabel}>Visualizados</Text>
            </View>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={COLORS.c3} style={{ marginTop: 40 }} />
        ) : itens.length === 0 ? (
          <Text style={styles.empty}>Nenhum alerta de vencimento.</Text>
        ) : (
          <FlatList
            data={itens}
            keyExtractor={item => String(item.idAlerta)}
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
  resumoVal:    { fontSize: 24, fontWeight: '600', color: COLORS.red },
  resumoLabel:  { fontSize: 11, color: '#888', marginTop: 2 },
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