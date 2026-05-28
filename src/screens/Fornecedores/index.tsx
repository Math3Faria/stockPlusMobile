import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  TextInput, Modal, Alert, ActivityIndicator,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import COLORS from '../../themes/colors';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Fornecedores'>;

const API_BASE_URL = 'http://SEU_IP:3000';

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

export default function Fornecedores() {
  const navigation = useNavigation<NavigationProps>();

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando]         = useState<Fornecedor | null>(null);
  const [form, setForm]                 = useState<FormFornecedor>(FORM_VAZIO);

  const fetchFornecedores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/fornecedores`);
      setFornecedores(await res.json());
    } catch {
      setFornecedores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFornecedores(); }, [fetchFornecedores]);

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
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  function confirmarExclusao(f: Fornecedor) {
    Alert.alert('Excluir', `Deseja excluir "${f.empresa}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluir(f.idFornecedor) },
    ]);
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

  const filtrados = fornecedores.filter(f =>
    f.empresa.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  function renderItem({ item }: { item: Fornecedor }) {
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.empresa}</Text>
          <Text style={styles.cardSub}>{item.email}</Text>
          <Text style={styles.cardSub}>CNPJ: {item.cnpj}</Text>
        </View>
        <TouchableOpacity style={styles.btnEdit} onPress={() => abrirEdicao(item)}>
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDelete} onPress={() => confirmarExclusao(item)}>
          <Text style={styles.btnText}>Excluir</Text>
        </TouchableOpacity>
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
        <Text style={styles.topbarTitle}>Fornecedores</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <TextInput
          style={styles.search}
          placeholder="Buscar fornecedor..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.count}>{filtrados.length} registros</Text>

        {loading ? (
          <ActivityIndicator color={COLORS.c3} style={{ marginTop: 32 }} />
        ) : filtrados.length === 0 ? (
          <Text style={styles.empty}>Nenhum fornecedor encontrado.</Text>
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={item => String(item.idFornecedor)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={abrirCadastro}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{editando ? 'Editar fornecedor' : 'Novo fornecedor'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Empresa *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome da empresa"
                  value={form.empresa}
                  onChangeText={v => setForm(p => ({ ...p, empresa: v }))}
                />
                <Text style={styles.label}>E-mail *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="contato@empresa.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={v => setForm(p => ({ ...p, email: v }))}
                />
                <Text style={styles.label}>CNPJ *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00000000000000"
                  keyboardType="numeric"
                  maxLength={14}
                  value={form.cnpj}
                  onChangeText={v => setForm(p => ({ ...p, cnpj: v }))}
                />
                <TouchableOpacity style={styles.submitBtn} onPress={handleSalvar} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color={COLORS.white} />
                    : <Text style={styles.submitText}>{editando ? 'Salvar' : 'Cadastrar'}</Text>
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
  search: {
    backgroundColor: COLORS.white, borderRadius: 8,
    borderWidth: 0.5, borderColor: COLORS.c3,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 13, color: COLORS.c1, marginBottom: 12,
  },
  count:       { fontSize: 11, color: COLORS.c3, marginBottom: 10 },
  empty:       { color: '#999', fontSize: 13, textAlign: 'center', marginTop: 40 },

  card: {
    backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.2)',
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  cardTitle:   { fontSize: 14, fontWeight: '500', color: COLORS.c1 },
  cardSub:     { fontSize: 12, color: '#888', marginTop: 2 },
  btnEdit:     { backgroundColor: COLORS.c3, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnDelete:   { backgroundColor: COLORS.red, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  btnText:     { color: COLORS.white, fontSize: 12, fontWeight: '600' },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    backgroundColor: COLORS.red, width: 52, height: 52,
    borderRadius: 99, alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  fabText:     { color: COLORS.white, fontSize: 28, lineHeight: 32 },

  overlay:     { flex: 1, backgroundColor: 'rgba(14,41,49,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 18, borderTopRightRadius: 18,
    padding: 20, paddingTop: 12,
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
  submitBtn:   { backgroundColor: COLORS.red, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  submitText:  { color: COLORS.white, fontSize: 15, fontWeight: '600' },
});