import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import COLORS from '../../themes/colors';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const API_BASE_URL = 'http://SEU_IP:3000';

export default function Login() {
  const navigation = useNavigation<NavigationProps>();

  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [verSenha, setVerSenha] = useState(false);

  async function handleLogin() {
    // TODO: remover bypass e descomentar chamada à API quando o backend estiver pronto
    navigation.replace('Home');

    /* --- chamada real à API (descomentar quando o backend estiver rodando) ---
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      if (!res.ok) throw new Error();
      navigation.replace('Home');
    } catch {
      Alert.alert('Erro', 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
    --- */
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.c1} />

      <View style={styles.top}>
        <Text style={styles.appName}>StockPlus</Text>
        <Text style={styles.appSub}>Gestão de estoque</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Entrar</Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            secureTextEntry={!verSenha}
            value={senha}
            onChangeText={setSenha}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setVerSenha(v => !v)}>
            <Text style={styles.eyeText}>{verSenha ? 'Ocultar' : 'Ver'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={styles.btnText}>Entrar</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.c1 },
  top: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingBottom: 32,
  },
  appName: { color: COLORS.white, fontSize: 36, fontWeight: '700' },
  appSub:  { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 },

  form: {
    backgroundColor: COLORS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  formTitle: { fontSize: 20, fontWeight: '600', color: COLORS.c1, marginBottom: 20 },
  label:     { fontSize: 12, color: COLORS.c3, fontWeight: '500', marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white, borderRadius: 8,
    borderWidth: 0.5, borderColor: 'rgba(43,117,116,0.4)',
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: COLORS.c1, marginBottom: 16,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  eyeBtn:   { paddingHorizontal: 10, paddingVertical: 10 },
  eyeText:  { fontSize: 12, color: COLORS.c3, fontWeight: '500' },
  btn: {
    backgroundColor: COLORS.red, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 4, marginBottom: 16,
  },
  btnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  link:    { textAlign: 'center', color: COLORS.c3, fontSize: 13 },
});
