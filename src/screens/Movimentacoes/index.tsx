import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, Modal, Alert, ActivityIndicator,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import COLORS from '../../themes/colors';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Movimentacoes'>;

const API_BASE_URL = 'http://SEU_IP:3000';

interface Movimentacao {
  idMovimentacao: number;
  idProduto: number;
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  dataValidade: string | null;
  descricao: string | null;
  dataMovimentacao: string;
}

interface FormMov {
  idProduto: string;
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: string;
  dataValidade: string;
  descricao: string;
}

const FORM_VAZIO: FormMov = {
  idProduto: '', tipo: 'ENTRADA', quantidade: '', dataValidade: '', descricao: '',
};

function formatData(dataStr: string): string {
  return new Date(dataStr).toLocaleDateString('pt-BR');
}

export default function Movimentacoes() {
  const navigation = useNavigation<NavigationProps>();

  const [movs, setMovs]             = useState<Movimentacao[]>([]);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [modalVisible, setModal]    = useState(false);
  const [form, setForm]             = useState<FormMov>(FORM_VAZIO);
  const [filtro, setFiltro]         = useState<'TODOS' | 'ENTRADA' | 'SAIDA'>('TODOS');

  const fetchMovs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/movimentacoes`);
      const data = await res.json();
      // API retorna { movimentacoes: [...] }
      setMovs(data.movimentacoes ?? []);
    } catch {
      setMovs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchMovs(); }, [fetchMovs]));

  async function handleSalvar() {
    const { idProduto, tipo, quantidade, dataValidade, descricao } = form;
    if (!idProduto || !quantidade) {
      Alert.alert('Atenção', 'Preencha ID do produto e quantidade.');
      return;
    }
    if (tipo === 'ENTRADA' && !dataValidade) {
      Alert.alert('Atenção', 'Data de validade é obrigatória para entradas.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/movimentacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idProduto: Number(idProduto),
          tipo,
          quantidade: Number(quantidade),
          dataValidade: dataValidade || null,
          descricao: descricao || null,
        }),
      });
      if (!res.ok) throw new Error();
      Alert.alert('Sucesso', 'Movimentação registrada!');
      setModal(false);
      setForm(FORM_VAZIO);
      fetchMovs();
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar.');
    } finally {
      setSaving(false);
    }
  }

  const filtrados = filtro === 'TODOS' ? movs : movs.filter(m => m.tipo === filtro);

  function renderItem({ item }: { item: Movimentacao }) {
    const isEntrada = item.tipo === 'ENTRADA';
    return (
      <View style={styles.card}>
        <View style={[styles.tipoBadge, isEntrada ? styles.badgeEntrada : styles.badgeSaida]}>
          <Text style={[styles.tipoText, { color: isEntrada ? '#0F6E56' : COLORS.red }]}>
            {item.tipo}
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardInfo}>Produto ID: <Text style={styles.cardVal}>{item.idProduto}</Text></Text>
          <Text style={styles.cardInfo}>Qtd: <Text style={styles.cardVal}>{item.quantidade}</Text></Text>
        </View>
        {item.descricao && <Text style={styles.cardDesc}>{item.descricao}</Text>}
        <Text style={styles.cardDate}>{formatData(item.dataMovimentacao)}</Text>
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
        <Text style={styles.topbarTitle}>Movimentações</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {/* Filtros */}
        <View style={styles.filtros}>
          {(['TODOS', 'ENTRADA', 'SAIDA'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroBtn, filtro === f && styles.filtroBtnAtivo]}
              onPress={() => setFiltro(f)}
            >
              <Text style={[styles.filtroText, filtro === f && styles.filtroTextAtivo]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.count}>{filtrados.length} registros</Text>

        {loading ? (
          <ActivityIndicator color={COLORS.c3} style={{ marginTop: 40 }} />
        ) : filtrados.length === 0 ? (
          <Text style={styles.empty}>Nenhuma movimentação encontrada.</Text>
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={item => String(item.idMovimentacao)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => setModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Nova movimentação</Text>
                <TouchableOpacity onPress={() => setModal(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>ID do Produto *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 1"
                  keyboardType="numeric"
                  value={form.idProduto}
                  onChangeText={v => setForm(p => ({ ...p, idProduto: v }))}
                />

                <Text style={styles.label}>Tipo *</Text>
                <View style={styles.tipoRow}>
                  {(['ENTRADA', 'SAIDA'] as const).map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.tipoOpt, form.tipo === t && (t === 'ENTRADA' ? styles.tipoOptEntrada : styles.tipoOptSaida)]}
                      onPress={() => setForm(p => ({ ...p, tipo: t }))}
                    >
                      <Text style={[styles.tipoOptText, form.tipo === t && { color: COLORS.white }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Quantidade *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={form.quantidade}
                  onChangeText={v => setForm(p => ({ ...p, quantidade: v }))}
                />

                {form.tipo === 'ENTRADA' && (
                  <>
                    <Text style={styles.label}>Data de Validade *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="AAAA-MM-DD"
                      value={form.dataValidade}
                      onChangeText={v => setForm(p => ({ ...p, dataValidade: v }))}
                    />
                  </>
                )}

                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Lote novo (opcional)"
                  value={form.descricao}
                  onChangeText={v => setForm(p => ({ ...p, descricao: v }))}
                />

                <TouchableOpacity style={styles.submitBtn} onPress={handleSalvar} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color={COLORS.white} />
                    : <Text style={styles.submitText}>Registrar</Text>
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
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backIcon:    { color: COLORS.white, fontSize: 24 },
  topbarTitle: { color: COLORS.white, fontSize: 17, fontWeight: '600' },

  body:        { flex: 1, backgroundColor: COLORS.bg, padding: 16 },

  filtros:     { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filtroBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.2)',
  },
  filtroBtnAtivo: { backgroundColor: COLORS.c2, borderColor: COLORS.c2 },
  filtroText:     { fontSize: 12, fontWeight: '600', color: COLORS.c3 },
  filtroTextAtivo:{ color: COLORS.white },

  count:       { fontSize: 11, color: COLORS.c3, marginBottom: 10 },
  empty:       { color: '#999', fontSize: 13, textAlign: 'center', marginTop: 40 },

  card: {
    backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.2)', padding: 12,
  },
  tipoBadge:    { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, marginBottom: 8 },
  badgeEntrada: { backgroundColor: '#e0f2f1' },
  badgeSaida:   { backgroundColor: '#fdecea' },
  tipoText:     { fontSize: 11, fontWeight: '600' },
  cardRow:      { flexDirection: 'row', gap: 16 },
  cardInfo:     { fontSize: 12, color: '#777' },
  cardVal:      { fontWeight: '600', color: COLORS.c1 },
  cardDesc:     { fontSize: 12, color: '#888', marginTop: 4 },
  cardDate:     { fontSize: 11, color: '#aaa', marginTop: 6 },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    backgroundColor: COLORS.red, width: 52, height: 52,
    borderRadius: 99, alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  fabText:     { color: COLORS.white, fontSize: 28, lineHeight: 32 },

  overlay:     { flex: 1, backgroundColor: 'rgba(14,41,49,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 18, borderTopRightRadius: 18,
    padding: 20, paddingTop: 12, maxHeight: '85%',
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
  tipoRow:        { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tipoOpt: {
    flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.3)', backgroundColor: COLORS.white,
  },
  tipoOptEntrada: { backgroundColor: COLORS.c3, borderColor: COLORS.c3 },
  tipoOptSaida:   { backgroundColor: COLORS.red, borderColor: COLORS.red },
  tipoOptText:    { fontSize: 13, fontWeight: '600', color: COLORS.c3 },
  submitBtn:      { backgroundColor: COLORS.red, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  submitText:     { color: COLORS.white, fontSize: 15, fontWeight: '600' },
});