import React, { useState, useEffect, useCallback } from 'react';
import {View,Text,TouchableOpacity,StyleSheet, ScrollView, TextInput, Modal, FlatList, ActivityIndicator,  Alert,  SafeAreaView, StatusBar, KeyboardAvoidingView,Platform} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Estoque'>;

const COLORS = {
  c1: '#0E2931',
  c2: '#12484C',
  c3: '#2B7574',
  red: '#861211',
  bg: '#E2E2E0',
  white: '#FFFFFF',
  light: '#F0F4F4',
  border: 'rgba(43,117,116,0.25)',
};

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

  const [produtos, setProdutos] = useState<Produto[]>([PRODUTO_EXEMPLO]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<NovoProduto>({
    nomeProduto: '',
    idCategoria: '',
    idFornecedor: '',
    valor: '',
    dataVencimento: '',
    quantidade: '',
    qtdMin: '',
    qtdMax: '',
    imagemProduto: '',
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
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

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

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
      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      setModalVisible(false);
      resetForm();
      fetchProdutos();
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar. Verifique a conexão.');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({
      nomeProduto: '',
      idCategoria: '',
      idFornecedor: '',
      valor: '',
      dataVencimento: '',
      quantidade: '',
      qtdMin: '',
      qtdMax: '',
      imagemProduto: '',
    });
  }

  const filtrados = produtos.filter(p =>
    p.nomeProduto.toLowerCase().includes(search.toLowerCase())
  );

  const totalCriticos = produtos.filter(p => getStatus(p.quantidade, p.qtdMin, p.qtdMax) === 'critical').length;

  function renderProduto({ item }: { item: Produto }) {
    const status = getStatus(item.quantidade, item.qtdMin, item.qtdMax);
    const pct = barPercent(item.quantidade, item.qtdMax);
    const pillStyle = status === 'ok' ? styles.pillOk : status === 'low' ? styles.pillLow : styles.pillCritical;
    const pillColor = status === 'ok' ? '#0F6E56' : status === 'low' ? '#854F0B' : COLORS.red;
    const barColor = status === 'ok' ? COLORS.c3 : status === 'low' ? '#EF9F27' : COLORS.red;
    const pillLabel = status === 'ok' ? 'OK' : status === 'low' ? 'Baixo' : 'Crítico';

    return (
      <View style={styles.productCard}>
        <View style={styles.productIcon}>
          <Text style={{ fontSize: 22 }}>📦</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName} numberOfLines={1}>{item.nomeProduto}</Text>
          <Text style={styles.productMeta}>{item.categoria}  ·  {item.fornecedor}</Text>
          <View style={styles.productRow2}>
            <Text style={styles.productPrice}>{formatBRL(item.valor)}</Text>
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
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.c1} />

      {/* Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: '#fff', fontSize: 20 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>📦 Estoque</Text>
        <View style={{ position: 'relative' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>🔔</Text>
          {totalCriticos > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{totalCriticos}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }}>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total de produtos</Text>
            <Text style={styles.statValue}>{produtos.length}</Text>
            <Text style={styles.statDesc}>itens cadastrados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Estoque crítico</Text>
            <Text style={[styles.statValue, { color: COLORS.red }]}>{totalCriticos}</Text>
            <Text style={styles.statDesc}>abaixo do mínimo</Text>
          </View>
        </View>

        {/* Atalhos para Fornecedores e Categorias */}
        <View style={styles.shortcutRow}>
          <TouchableOpacity
            style={styles.shortcut}
            onPress={() => navigation.navigate('Fornecedores')}
          >
            <Text style={styles.shortcutIcon}>🚚</Text>
            <Text style={styles.shortcutLabel}>Fornecedores</Text>
            <Text style={styles.shortcutArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcut}
            onPress={() => navigation.navigate('Categorias')}
          >
            <Text style={styles.shortcutIcon}>🏷️</Text>
            <Text style={styles.shortcutLabel}>Categorias</Text>
            <Text style={styles.shortcutArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Busca */}
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16, color: COLORS.c3 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produto..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Lista */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Produtos em estoque</Text>
          <Text style={styles.sectionCount}>{filtrados.length} itens</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.c3} style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={item => String(item.idProduto)}
            renderItem={renderProduto}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={{ color: '#fff', fontSize: 28, lineHeight: 32 }}>+</Text>
      </TouchableOpacity>

      {/* Modal Cadastro */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cadastrar produto</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ fontSize: 22, color: '#999' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.formLabel}>Nome do produto *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Paracetamol 500mg"
                  value={form.nomeProduto}
                  onChangeText={v => setForm(p => ({ ...p, nomeProduto: v }))}
                />

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>ID Categoria *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Ex: 1"
                      keyboardType="numeric"
                      value={form.idCategoria}
                      onChangeText={v => setForm(p => ({ ...p, idCategoria: v }))}
                    />
                  </View>
                  <View style={{ width: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>ID Fornecedor *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Ex: 1"
                      keyboardType="numeric"
                      value={form.idFornecedor}
                      onChangeText={v => setForm(p => ({ ...p, idFornecedor: v }))}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Valor (R$) *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0,00"
                      keyboardType="decimal-pad"
                      value={form.valor}
                      onChangeText={v => setForm(p => ({ ...p, valor: v }))}
                    />
                  </View>
                  <View style={{ width: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Vencimento *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="AAAA-MM-DD"
                      value={form.dataVencimento}
                      onChangeText={v => setForm(p => ({ ...p, dataVencimento: v }))}
                    />
                  </View>
                </View>

                <Text style={styles.sectionDivider}>Controle de estoque</Text>

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Qtd. atual *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={form.quantidade}
                      onChangeText={v => setForm(p => ({ ...p, quantidade: v }))}
                    />
                  </View>
                  <View style={{ width: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Qtd. mínima *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={form.qtdMin}
                      onChangeText={v => setForm(p => ({ ...p, qtdMin: v }))}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Qtd. máxima *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={form.qtdMax}
                      onChangeText={v => setForm(p => ({ ...p, qtdMax: v }))}
                    />
                  </View>
                  <View style={{ width: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Imagem (URL)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="https://..."
                      value={form.imagemProduto}
                      onChangeText={v => setForm(p => ({ ...p, imagemProduto: v }))}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleCadastrar} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitBtnText}>✓  Cadastrar produto</Text>
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
  safe: { flex: 1, backgroundColor: COLORS.c1 },
  topbar: {
    backgroundColor: COLORS.c1,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  topbarTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  alertBadge: {
    position: 'absolute', top: -4, right: -6,
    backgroundColor: COLORS.red, borderRadius: 99,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  alertBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: COLORS.border, padding: 12,
  },
  statLabel: { fontSize: 11, color: COLORS.c3, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '500', color: COLORS.c2 },
  statDesc: { fontSize: 10, color: '#999', marginTop: 2 },

  shortcutRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4,
  },
  shortcut: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: COLORS.border,
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  shortcutIcon: { fontSize: 18 },
  shortcutLabel: { flex: 1, fontSize: 13, fontWeight: '500', color: COLORS.c1 },
  shortcutArrow: { fontSize: 20, color: COLORS.c3 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.white, borderRadius: 8,
    borderWidth: 0.5, borderColor: COLORS.c3,
    paddingHorizontal: 12, paddingVertical: 8,
    marginHorizontal: 16, marginTop: 10, marginBottom: 2,
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.c1 },

  sectionHeader: {
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionLabel: { fontSize: 12, color: COLORS.c3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCount: { fontSize: 11, color: COLORS.c3 },

  productCard: {
    backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: COLORS.border,
    padding: 12, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  productIcon: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: COLORS.light, alignItems: 'center', justifyContent: 'center',
  },
  productName: { fontSize: 14, fontWeight: '500', color: COLORS.c1 },
  productMeta: { fontSize: 11, color: '#777', marginTop: 2 },
  productRow2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  productPrice: { fontSize: 15, fontWeight: '500', color: COLORS.c2 },
  barWrap: { marginTop: 6, backgroundColor: '#e8eeee', borderRadius: 4, height: 4 },
  bar: { height: 4, borderRadius: 4 },

  pillOk: { backgroundColor: '#e0f2f1', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99 },
  pillLow: { backgroundColor: '#fff3e0', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99 },
  pillCritical: { backgroundColor: '#fdecea', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 99 },
  pillText: { fontSize: 11, fontWeight: '500' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    backgroundColor: COLORS.red, width: 52, height: 52,
    borderRadius: 99, alignItems: 'center', justifyContent: 'center', elevation: 5,
  },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(14,41,49,0.6)', justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 18, borderTopRightRadius: 18,
    paddingHorizontal: 18, paddingTop: 12, maxHeight: '90%',
  },
  modalHandle: {
    width: 36, height: 4, backgroundColor: '#ddd', borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '600', color: COLORS.c1 },
  formLabel: { fontSize: 12, color: COLORS.c3, fontWeight: '500', marginBottom: 5, marginTop: 8 },
  formInput: {
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.4)',
    borderRadius: 8, padding: 9, paddingHorizontal: 12,
    fontSize: 13, color: COLORS.c1, backgroundColor: COLORS.white,
  },
  formRow: { flexDirection: 'row', alignItems: 'flex-start' },
  sectionDivider: {
    fontSize: 11, color: COLORS.c3, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
    borderTopWidth: 0.5, borderTopColor: '#e0e8e8',
    paddingTop: 12, marginTop: 14, marginBottom: 4,
  },
  submitBtn: {
    backgroundColor: COLORS.red, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 14,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
