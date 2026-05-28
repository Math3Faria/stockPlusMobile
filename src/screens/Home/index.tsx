import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const COLORS = {
  c1: '#0E2931',
  c2: '#12484C',
  c3: '#2B7574',
  red: '#861211',
  bg: '#E2E2E0',
  white: '#FFFFFF',
  light: '#F0F4F4',
};

export default function Home() {
  const navigation = useNavigation<NavigationProps>();

  const menuItems = [
    {
      route: 'Estoque' as keyof RootStackParamList,
      label: 'Estoque',
      desc: 'Gerencie seus produtos',
    },
    {
      route: 'Fornecedores' as keyof RootStackParamList,
      label: 'Fornecedores',
      desc: 'Veja seus parceiros',
    },
    {
      route: 'Categorias' as keyof RootStackParamList,
      label: 'Categorias',
      desc: 'Organize os setores',
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.c1} />
      <View style={styles.header}>
        <Text style={styles.headerSub}>Bem-vindo ao</Text>
        <Text style={styles.headerTitle}>StockPlus</Text>
        <Text style={styles.headerDesc}>Selecione um módulo para começar</Text>
      </View>
      <View style={styles.body}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.route}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(item.route as any)}
          >
            <View style={styles.cardText}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>StockPlus © 2025</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    backgroundColor: COLORS.c1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 2,
  },
  headerDesc: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    marginTop: 6,
  },
  body: {
    flex: 1,
    padding: 20,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(43,117,116,0.2)',
    elevation: 1,
  },
  cardText: { flex: 1 },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.c1,
  },
  cardDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  arrow: {
    fontSize: 22,
    color: COLORS.c3,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#aaa',
  },
});