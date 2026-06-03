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

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'AlertaEstoque'>;

// ✅ Campos reais da tabela Alerta no banco
interface Alerta {
  idAlerta:       number;
  tipo:           string;     // ex: 'ESTOQUE'
  idProduto:      number;
  mensagem:       string;
  dataGeracao:    string;
  foiVisualizado: boolean;
}

export default function AlertaEstoque() {
  const navigation = useNavigation<NavigationProps>();

  const [itens, setItens]     = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(false);

  // ─── GET /alertas  →  Alerta[]  ─────────────────────────────────────────────
  // Filtra apenas alertas de tipo ESTOQUE no front
  const fetchAlertas = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Alerta[]>('/alertas');
      const estoque = data.filter(a =>
        a.tipo?.toUpperCase().includes('ESTOQUE')
      );
      setItens(estoque);
    } catch (error) {
      console.error('Erro ao buscar alertas de estoque:', error);
      setItens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAlertas(); }, [fetchAlertas]));

  function renderItem({ item }: { item: Alerta }) {
    const isCritical = !item.foiVisualizado;

    return (
      <View style={styles.card}>
        <View style={[styles.badge, isCritical ? styles.badgeCritical : styles.badgeLow]}>
          <Text style={[styles.badgeText, { color: isCritical ? COLORS.red : '#854F0B' }]}>
            {isCritical ? 'Crítico' : 'Visualizado'}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>Produto ID: {item.idProduto}</Text>
        <Text style={styles.cardSub}>{item.mensagem}</Text>
        <Text style={styles.cardDate}>
          Gerado em: {new Date(item.dataGeracao).toLocaleDateString('pt-BR')}
        </Text>
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
          {loading ? '...' : `${itens.length} produto(s) com alerta de estoque`}
        </Text>

        {loading ? (
          <ActivityIndicator color={COLORS.c3} style={{ marginTop: 40 }} />
        ) : itens.length === 0 ? (
          <Text style={styles.empty}>Nenhum alerta de estoque.</Text>
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
  cardSub:       { fontSize: 12, color: '#888', marginTop: 2 },
  cardDate:      { fontSize: 12, color: COLORS.c3, marginTop: 6, fontWeight: '500' },
  barWrap:       { backgroundColor: '#e8eeee', borderRadius: 4, height: 4 },
  bar:           { height: 4, borderRadius: 4 },
});