import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Modal, FlatList, ActivityIndicator,
  Alert, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import COLORS from '../../themes/colors';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Estoque'>;

const API_BASE_URL = 'http://SEU_IP:3000';

interface Produto {
  idProduto: number;
  nomeProduto: string;
  valor: number;
  dataVencimento: string;
  quantidade: number;
  qtdMax: number;
  qtdMin: number;
  imagemProduto: string;
  dataCad: string;
  categoria: string;
  fornecedor: string;
}

interface NovoProduto {
  nomeProduto: string;
  idCategoria: string;
  idFornecedor: string;
  valor: string;
  dataVencimento: string;
  quantidade: string;
  qtdMin: string;
  qtdMax: string;
  imagemProduto: string;
}

const FORM_VAZIO: NovoProduto = {
  nomeProduto: '', idCategoria: '', idFornecedor: '',
  valor: '', dataVencimento: '', quantidade: '',
  qtdMin: '', qtdMax: '', imagemProduto: '',
};

const PRODUTO_EXEMPLO: Produto = {
  idProduto: 0,
  nomeProduto: 'Paracetamol 500mg',
  valor: 12.9,
  dataVencimento: '2026-12-01',
  quantidade: 340,
  qtdMax: 500,
  qtdMin: 50,
  imagemProduto: '',
  dataCad: new Date().toISOString(),
  categoria: 'Analgésicos',
  fornecedor: 'FarmaCorp Ltda',
};

function getStatus(qtd: number, min: number, max: number) {
  if (qtd <= min) return 'critical';
  if (qtd <= min * 1.5) return 'low';
  return 'ok';
}

function barPercent(qtd: number, max: number) {
  if (!max) return 0;
  return Math.min((qtd / max) * 100, 100);
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Estoque() {
  const navigation = useNavigation<NavigationProps>();

  const [produtos, setProdutos]         = useState<Produto[]>([PRODUTO_EXEMPLO]);
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm]                 = useState<NovoProduto>(FORM_VAZIO);

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/produtos`);
      const data: Produto[] = await res.json();
      setProdutos([PRODUTO_EXEMPLO, ...data]);
    } catch {
      setProdutos([PRODUTO_EXEMPLO]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProdutos(); }, [fetchProdutos]);

  async function handleCadastrar() {
    const { nomeProduto, idCategoria, idFornecedor, valor, dataVencimento, quantidade, qtdMin, qtdMax } = form;
    if (!nomeProduto || !idCategoria || !idFornecedor || !valor || !dataVencimento || !quantidade || !qtdMin || !qtdMax) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeProduto,
          idCategoria: Number(idCategoria),
          idFornecedor: Number(idFornecedor),
          valor: parseFloat(valor.replace(',', '.')),
          dataVencimento,
          quantidade: Number(quantidade),
          qtdMin: Number(qtdMin),
          qtdMax: Number(qtdMax),
          imagemProduto: form.imagemProduto || '',
        }),
      });
      if (!res.ok) throw new Error();
      Alert.alert('Sucesso', 'Produto cadastrado!');
      setModalVisible(false);
      setForm(FORM_VAZIO);
      fetchProdutos();
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar.');
    } finally {
      setSaving(false);
    }
  }

  const filtrados = produtos.filter(p =>
    p.nomeProduto.toLowerCase().includes(search.toLowerCase())
  );

  const totalCriticos = produtos.filter(
    p => getStatus(p.quantidade, p.qtdMin, p.qtdMax) === 'critical'
  ).length;

  function renderProduto({ item }: { item: Produto }) {
    const status    = getStatus(item.quantidade, item.qtdMin, item.qtdMax);
    const pct       = barPercent(item.quantidade, item.qtdMax);
    const barColor  = status === 'ok' ? COLORS.c3 : status === 'low' ? '#EF9F27' : COLORS.red;
    const pillStyle = status === 'ok' ? styles.pillOk : status === 'low' ? styles.pillLow : styles.pillCritical;
    const pillColor = status === 'ok' ? '#0F6E56' : status === 'low' ? '#854F0B' : COLORS.red;
    const pillLabel = status === 'ok' ? 'OK' : status === 'low' ? 'Baixo' : 'Crítico';

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.nomeProduto}</Text>
        <Text style={styles.cardMeta}>{item.categoria}  ·  {item.fornecedor}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardPrice}>{formatBRL(item.valor)}</Text>
          <View style={pillStyle}>
            <Text style={[styles.pillText, { color: pillColor }]}>
              {pillLabel} · {item.quantidade} un
            </Text>
          </View>
        </View>
        <View style={styles.barWrap}>
          <View style={[styles.bar, { width: `${pct}%` as any, backgroundColor: barColor }]} />
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
        <Text style={styles.topbarTitle}>Estoque</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.body}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{produtos.length}</Text>
            <Text style={styles.statDesc}>produtos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Crítico</Text>
            <Text style={[styles.statValue, { color: COLORS.red }]}>{totalCriticos}</Text>
            <Text style={styles.statDesc}>abaixo do mínimo</Text>
          </View>
        </View>

        <View style={styles.shortcutRow}>
          <TouchableOpacity style={styles.shortcut} onPress={() => navigation.navigate('Fornecedores')}>
            <Text style={styles.shortcutLabel}>Fornecedores</Text>
            <Text style={styles.shortcutArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcut} onPress={() => navigation.navigate('Categorias')}>
            <Text style={styles.shortcutLabel}>Categorias</Text>
            <Text style={styles.shortcutArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Buscar produto..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.count}>{filtrados.length} itens</Text>

        {loading ? (
          <ActivityIndicator color={COLORS.c3} style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={item => String(item.idProduto)}
            renderItem={renderProduto}
            contentContainerStyle={{ paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Cadastrar produto</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Nome do produto *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Paracetamol 500mg"
                  value={form.nomeProduto}
                  onChangeText={v => setForm(p => ({ ...p, nomeProduto: v }))}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>ID Categoria *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 1"
                      keyboardType="numeric"
                      value={form.idCategoria}
                      onChangeText={v => setForm(p => ({ ...p, idCategoria: v }))}
                    />
                  </View>
                  <View style={{ width: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>ID Fornecedor *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 1"
                      keyboardType="numeric"
                      value={form.idFornecedor}
                      onChangeText={v => setForm(p => ({ ...p, idFornecedor: v }))}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Valor (R$) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0,00"
                      keyboardType="decimal-pad"
                      value={form.valor}
                      onChangeText={v => setForm(p => ({ ...p, valor: v }))}
                    />
                  </View>
                  <View style={{ width: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Vencimento *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="AAAA-MM-DD"
                      value={form.dataVencimento}
                      onChangeText={v => setForm(p => ({ ...p, dataVencimento: v }))}
                    />
                  </View>
                </View>

                <Text style={styles.divider}>Controle de estoque</Text>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Qtd. atual *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={form.quantidade}
                      onChangeText={v => setForm(p => ({ ...p, quantidade: v }))}
                    />
                  </View>
                  <View style={{ width: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Qtd. mínima *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={form.qtdMin}
                      onChangeText={v => setForm(p => ({ ...p, qtdMin: v }))}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Qtd. máxima *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={form.qtdMax}
                      onChangeText={v => setForm(p => ({ ...p, qtdMax: v }))}
                    />
                  </View>
                  <View style={{ width: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Imagem (URL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="https://..."
                      value={form.imagemProduto}
                      onChangeText={v => setForm(p => ({ ...p, imagemProduto: v }))}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleCadastrar} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color={COLORS.white} />
                    : <Text style={styles.submitText}>Cadastrar produto</Text>
                  }
                </TouchableOpacity>
                <View style={{ height: 24 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.c1 },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.c1,
  },
  backIcon:    { color: COLORS.white, fontSize: 24 },
  topbarTitle: { color: COLORS.white, fontSize: 17, fontWeight: '600' },

  body:        { flex: 1, backgroundColor: COLORS.bg, padding: 16 },

  statsRow:    { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.2)', padding: 12,
  },
  statLabel:   { fontSize: 11, color: COLORS.c3, marginBottom: 4 },
  statValue:   { fontSize: 22, fontWeight: '500', color: COLORS.c2 },
  statDesc:    { fontSize: 10, color: '#999', marginTop: 2 },

  shortcutRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  shortcut: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.2)',
    padding: 12, flexDirection: 'row', alignItems: 'center',
  },
  shortcutLabel: { flex: 1, fontSize: 13, fontWeight: '500', color: COLORS.c1 },
  shortcutArrow: { fontSize: 20, color: COLORS.c3 },

  search: {
    backgroundColor: COLORS.white, borderRadius: 8,
    borderWidth: 0.5, borderColor: COLORS.c3,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 13, color: COLORS.c1, marginBottom: 8,
  },
  count:       { fontSize: 11, color: COLORS.c3, marginBottom: 10 },

  card: {
    backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.2)', padding: 12,
  },
  cardTitle:   { fontSize: 14, fontWeight: '500', color: COLORS.c1 },
  cardMeta:    { fontSize: 11, color: '#777', marginTop: 2 },
  cardRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  cardPrice:   { fontSize: 15, fontWeight: '500', color: COLORS.c2 },
  barWrap:     { marginTop: 8, backgroundColor: '#e8eeee', borderRadius: 4, height: 4 },
  bar:         { height: 4, borderRadius: 4 },
  pillOk:      { backgroundColor: '#e0f2f1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  pillLow:     { backgroundColor: '#fff3e0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  pillCritical:{ backgroundColor: '#fdecea', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  pillText:    { fontSize: 11, fontWeight: '500' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    backgroundColor: COLORS.red, width: 52, height: 52,
    borderRadius: 99, alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  fabText:     { color: COLORS.white, fontSize: 28, lineHeight: 32 },

  overlay:     { flex: 1, backgroundColor: 'rgba(14,41,49,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 18, borderTopRightRadius: 18,
    padding: 20, paddingTop: 12, maxHeight: '90%',
  },
  handle:      { width: 36, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sheetTitle:  { fontSize: 16, fontWeight: '600', color: COLORS.c1 },
  closeBtn:    { fontSize: 20, color: '#999' },
  label:       { fontSize: 12, color: COLORS.c3, fontWeight: '500', marginBottom: 6 },
  input: {
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.4)', borderRadius: 8,
    padding: 10, paddingHorizontal: 12, fontSize: 13, color: COLORS.c1,
    backgroundColor: COLORS.white, marginBottom: 16,
  },
  row:         { flexDirection: 'row', alignItems: 'flex-start' },
  divider: {
    fontSize: 11, color: COLORS.c3, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
    borderTopWidth: 0.5, borderTopColor: '#e0e8e8',
    paddingTop: 12, marginTop: 4, marginBottom: 4,
  },
  submitBtn:   { backgroundColor: COLORS.red, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  submitText:  { color: COLORS.white, fontSize: 15, fontWeight: '600' },
});