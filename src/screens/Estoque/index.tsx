import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function Estoque() {
  const navigation = useNavigation<NavigationProps>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Gerenciamento de</Text>
        <Text style={styles.headerTitle}>Estoque e Produtos</Text>
      </View>

      <View style={styles.resumoContainer}>
        <View style={styles.cardResumo}>
          <Text style={styles.resumoNumero}>124</Text>
          <Text style={styles.resumoLabel}>Itens Ativos</Text>
        </View>
        <View style={styles.cardResumo}>
          <Text style={[styles.resumoNumero, { color: '#E74C3C' }]}>3</Text>
          <Text style={styles.resumoLabel}>Esgotados</Text>
        </View>
      </View>

      <View style={styles.menuGrid}>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('Fornecedores')} 
          style={styles.menuItem}
          activeOpacity={0.7}
        >
          <View style={[styles.iconeContainer, { backgroundColor: '#E0F2FE' }]}>
            <Text style={{ fontSize: 20 }}>🚚</Text>
          </View>
          <Text style={styles.buttonText}>Fornecedores</Text>
          <Text style={styles.buttonSubtext}>Ver parceiros</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Categorias')} 
          style={styles.menuItem}
          activeOpacity={0.7}
        >
          <View style={[styles.iconeContainer, { backgroundColor: '#FEE2E2' }]}>
            <Text style={{ fontSize: 20 }}>🏷️</Text>
          </View>
          <Text style={styles.buttonText}>Categorias</Text>
          <Text style={styles.buttonSubtext}>Organizar setores</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', 
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 25,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  resumoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 30,
  },
  cardResumo: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  resumoNumero: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  resumoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  menuItem: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start', 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconeContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});
