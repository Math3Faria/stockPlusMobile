import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function Fornecedores() {
    const navigation = useNavigation<NavigationProps>();

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Página de Fornecedores</Text>

            <TouchableOpacity style={styles.btnAdd} onPress={() => {}}>
                <Text style={styles.btnTextAdd}>+ Novo Fornecedor</Text>
            </TouchableOpacity>

            <ScrollView style={{ width: '100%', marginTop: 15 }}>
                <View style={styles.card}>
                    <View>
                        <Text style={styles.cardTitle}>Fornecedor Exemplo A</Text>
                        <Text style={styles.cardSubtitle}>(11) 99999-9999</Text>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.btnEdit} onPress={() => {}}>
                            <Text style={styles.btnTextAction}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDelete} onPress={() => {}}>
                            <Text style={styles.btnTextAction}>Excluir</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.card}>
                    <View>
                        <Text style={styles.cardTitle}>Fornecedor Exemplo B</Text>
                        <Text style={styles.cardSubtitle}>(21) 88888-8888</Text>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.btnEdit} onPress={() => {}}>
                            <Text style={styles.btnTextAction}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDelete} onPress={() => {}}>
                            <Text style={styles.btnTextAction}>Excluir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footerNav}>
                <TouchableOpacity onPress={() => navigation.navigate('Estoque' as any)} style={styles.button}>
                    <Text style={styles.buttonText}>Ir para Estoque</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Categorias')} style={styles.button}>
                    <Text style={styles.buttonText}>Ir para Categorias</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 15
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15
    },
    btnAdd: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%'
    },
    btnTextAdd: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    cardSubtitle: {
        color: '#666',
        fontSize: 14
    },
    actions: {
        flexDirection: 'row',
        marginLeft: 'auto'
    },
    btnEdit: {
        backgroundColor: '#ffc107',
        padding: 8,
        borderRadius: 5,
        marginRight: 5
    },
    btnDelete: {
        backgroundColor: '#dc3545',
        padding: 8,
        borderRadius: 5
    },
    btnTextAction: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600'
    },
    footerNav: {
        marginTop: 'auto',
        marginBottom: 15,
        width: '100%'
    },
    button: {
        backgroundColor: '#000000',
        borderRadius: 20,
        width: '100%',
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        color: "white",
        fontWeight: '500'
    }
});
