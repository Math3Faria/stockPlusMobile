import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Fornecedores'>;

// ─── Paleta ───────────────────────────────────────────────────────────────────
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

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface Fornecedor {
  idFornecedor: number;
  empresa: string;
  email: string;
  cnpj: string;
}

interface FormFornecedor {
  empresa: string;
  email: string;
  cnpj: string;
}

const FORM_VAZIO: FormFornecedor = { empresa: '', email: '', cnpj: '' };

// ─────────────────────────────────────────────────────────────────────────────
export default function Fornecedores() {
  const navigation = useNavigation<NavigationProps>();

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [form, setForm] = useState<FormFornecedor>(FORM_VAZIO);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchFornecedores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/fornecedores`);
      const data: Fornecedor[] = await res.json();
      setFornecedores(data);
    } catch {
      setFornecedores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores]);

  // ── Abrir modal ────────────────────────────────────────────────────────────
  function abrirCadastro() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setModalVisible(true);
  }

  function abrirEdicao(f: Fornecedor) {
    setEditando(f);
    setForm({ empresa: f.empresa, email: f.email, cnpj: f.cnpj });
    setModalVisible(true);
  }

  // ── Salvar (criar ou editar) ───────────────────────────────────────────────
  async function handleSalvar() {
    if (!form.empresa || !form.email || !form.cnpj) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    setSaving(true);
    try {
      if (editando) {
        const res = await fetch(`${API_BASE_URL}/fornecedores/${editando.idFornecedor}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        Alert.alert('Sucesso', 'Fornecedor atualizado!');
      } else {
        const res = await fetch(`${API_BASE_URL}/fornecedores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        Alert.alert('Sucesso', 'Fornecedor cadastrado!');
      }
      setModalVisible(false);
      fetchFornecedores();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Verifique a conexão.');
    } finally {
      setSaving(false);
    }
  }

  // ── Excluir ───────────────────────────────────────────────────────────────
  function confirmarExclusao(f: Fornecedor) {
    Alert.alert(
      'Excluir fornecedor',
      `Deseja excluir "${f.empresa}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluir(f.idFornecedor) },
      ]
    );
  }

  async function excluir(id: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/fornecedores/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchFornecedores();
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir.');
    }
  }

  // ── Filtro ────────────────────────────────────────────────────────────────
  const filtrados = fornecedores.filter(f =>
    f.empresa.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render item ───────────────────────────────────────────────────────────
  function renderItem({ item }: { item: Fornecedor }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <Text style={{ fontSize: 20 }}>🚚</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.empresa}</Text>
          <Text style={styles.cardSub}>{item.email}</Text>
          <Text style={[styles.cardSub, { fontSize: 11 }]}>CNPJ: {item.cnpj}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnEdit} onPress={() => abrirEdicao(item)}>
            <Text style={styles.btnActionText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDelete} onPress={() => confirmarExclusao(item)}>
            <Text style={styles.btnActionText}>Excluir</Text>
          </TouchableOpacity>
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
        <Text style={styles.topbarTitle}>🚚 Fornecedores</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        {/* Busca */}
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 15, color: COLORS.c3 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar fornecedor..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Contagem */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Fornecedores</Text>
          <Text style={styles.sectionCount}>{filtrados.length} registros</Text>
        </View>

        {/* Lista */}
        {loading ? (
          <ActivityIndicator color={COLORS.c3} style={{ marginTop: 40 }} />
        ) : filtrados.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum fornecedor encontrado.</Text>
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={item => String(item.idFornecedor)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </View>

      {/* Navegação rápida */}
      <View style={styles.footerNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Estoque' as any)}>
          <Text style={styles.navBtnText}>📦 Estoque</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Categorias')}>
          <Text style={styles.navBtnText}>🏷️ Categorias</Text>
        </TouchableOpacity>
      </View>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={abrirCadastro}>
        <Text style={{ color: '#fff', fontSize: 28, lineHeight: 32 }}>+</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editando ? 'Editar fornecedor' : 'Novo fornecedor'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ fontSize: 22, color: '#999' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.formLabel}>Empresa *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nome da empresa"
                  value={form.empresa}
                  onChangeText={v => setForm(p => ({ ...p, empresa: v }))}
                />

                <Text style={styles.formLabel}>E-mail *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="contato@empresa.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={v => setForm(p => ({ ...p, email: v }))}
                />

                <Text style={styles.formLabel}>CNPJ *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="00000000000000"
                  keyboardType="numeric"
                  maxLength={14}
                  value={form.cnpj}
                  onChangeText={v => setForm(p => ({ ...p, cnpj: v }))}
                />

                <TouchableOpacity style={styles.submitBtn} onPress={handleSalvar} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitBtnText}>
                        ✓  {editando ? 'Salvar alterações' : 'Cadastrar fornecedor'}
                      </Text>
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

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.c1 },
  topbar: {
    backgroundColor: COLORS.c1,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  topbarTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.white, borderRadius: 8,
    borderWidth: 0.5, borderColor: COLORS.c3,
    paddingHorizontal: 12, paddingVertical: 8,
    margin: 16, marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.c1 },

  sectionHeader: {
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionLabel: { fontSize: 12, color: COLORS.c3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCount: { fontSize: 11, color: COLORS.c3 },

  card: {
    backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: COLORS.border,
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: COLORS.light, alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: '500', color: COLORS.c1 },
  cardSub: { fontSize: 12, color: '#777', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  btnEdit: {
    backgroundColor: COLORS.c3, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 6,
  },
  btnDelete: {
    backgroundColor: COLORS.red, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 6,
  },
  btnActionText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  emptyText: { color: '#999', fontSize: 13, textAlign: 'center', marginTop: 40 },

  footerNav: {
    backgroundColor: COLORS.bg,
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 0.5, borderTopColor: COLORS.border,
  },
  navBtn: {
    flex: 1, backgroundColor: COLORS.c2, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  navBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  fab: {
    position: 'absolute', bottom: 80, right: 20,
    backgroundColor: COLORS.red, width: 52, height: 52,
    borderRadius: 99, alignItems: 'center', justifyContent: 'center', elevation: 5,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(14,41,49,0.6)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 18, borderTopRightRadius: 18,
    paddingHorizontal: 18, paddingTop: 12, maxHeight: '85%',
  },
  modalHandle: {
    width: 36, height: 4, backgroundColor: '#ddd', borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '600', color: COLORS.c1 },
  formLabel: { fontSize: 12, color: COLORS.c3, fontWeight: '500', marginBottom: 5, marginTop: 10 },
  formInput: {
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.4)',
    borderRadius: 8, padding: 9, paddingHorizontal: 12,
    fontSize: 13, color: COLORS.c1, backgroundColor: COLORS.white,
  },
  submitBtn: {
    backgroundColor: COLORS.red, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 18,
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});