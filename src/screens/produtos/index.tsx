import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, FlatList, View, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

export type Produto = {
    id: number,
    nomeProduto: string,
    valorPar: number,
    valorAVista: number,
    imagem: string
}

type Quantidades = {
    [key: number]: number
}

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'NovoProd'>;
export default function Produtos() {
    const produtos: Produto[] = [
        { id: 1, nomeProduto: 'Mouse Gamer', valorPar: 120, valorAVista: 105.9, imagem: '../../../assets/MouseGamer' }
    ]

    const navigation = useNavigation<NavigationProps>();
    const [quantidades, setQuantidades] = useState<Quantidades>({})
    const [busca, setBusca] = useState('')

    const produtosFiltrados = produtos.filter(produtos =>
        produtos.nomeProduto.toLocaleLowerCase().startsWith(busca.toLocaleLowerCase())
    );

    const aumentar = (id: number) => {
        setQuantidades(valor => ({
            ...valor,
            [id]: (valor[id] || 1) + 1
        }))
    }

    const diminuir = (id: number) => {
        setQuantidades(valor => ({
            ...valor,
            [id]: (valor[id] || 1) > 1 ? (valor[id] || 1) - 1 : 1
        }))
    }

    return (
        <View style={styles.container}>
            <View>
                <TouchableOpacity onPress={() => navigation.navigate('NovoProd')} style={styles.buttonAddProd}>
                    <Text style={styles.textAddCarrinho}>+ Adicionar Produto</Text>
                </TouchableOpacity>

            </View>
            <View style={{ padding: 20, backgroundColor: '#F8F8F8' }}>
                <TextInput
                    placeholder='Digite para pesquisar'
                    style={styles.textBusca}
                    value={busca}
                    onChangeText={setBusca}
                />
            </View>
            <FlatList
                data={produtosFiltrados}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const qtd = quantidades[item.id] || 1;

                    return (
                        <View style={styles.card}>
                            <Image
                                source={require('../../../assets/MouseGamer.jpg')}
                                style={styles.imagem}
                            />

                            <Text style={styles.nomeProduto}>{item.nomeProduto}</Text>

                            <View style={styles.precoContainer}>
                                <Text>Valor parcelado</Text>
                                <Text style={styles.precoParcelado}>
                                    R$ {(item.valorPar * qtd).toFixed(2).replace('.', ',')}
                                </Text>
                            </View>

                            <View style={styles.precoContainer}>
                                <Text>Valor à vista</Text>
                                <Text style={styles.precoAVista}>
                                    R$ {(item.valorAVista * qtd).toFixed(2).replace('.', ',')}
                                </Text>
                            </View>

                            <View style={styles.acoesContainer}>
                                <View style={styles.grupoQuantidade}>
                                    <TouchableOpacity onPress={() => diminuir(item.id)} style={styles.buttonQtd}>
                                        <Text>-</Text>
                                    </TouchableOpacity>

                                    <Text style={styles.quantidade}>{qtd}</Text>

                                    <TouchableOpacity onPress={() => aumentar(item.id)} style={styles.buttonQtd}>
                                        <Text>+</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.grupoAcoesDireita}>
                                    <TouchableOpacity style={styles.buttonEditar}>
                                        <Text style={styles.textAddCarrinho}>Editar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.buttonExcluir, { marginLeft: 5 }]}>
                                        <Text style={styles.textAddCarrinho}>Excluir</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity style={[styles.buttonAddCarrinho, { marginTop: 10, width: '100%', alignItems: 'center' }]}>
                                <Text style={styles.textAddCarrinho}>Adicionar ao Carrinho</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#f5f5f5',
        // padding: 10,
    },
    textBusca: {
        borderRadius: 25,
        backgroundColor: '#FFF',
        padding: 15,
        alignItems: 'center',
        elevation: 2
    },
    imagem: {
        width: 100,
        height: 100,
        marginBottom: 10,
        resizeMode: 'contain',

        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',

        elevation: 3,

        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }
    },
    precoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 5
    },
    nomeProduto: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center'
    },
    precoParcelado: {
        fontSize: 14,
        color: '#555'
    },
    precoAVista: {
        fontSize: 16,
        color: '#2ecc71',
        fontWeight: 'bold'
    },
    buttonQtd: {
        backgroundColor: '#ddd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8
    },
    quantidade: {
        marginHorizontal: 10,
        fontSize: 16,
        fontWeight: 'bold'
    },
    buttonAddCarrinho: {
        backgroundColor: '#2c363c',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
    },
    buttonAddProd: {
        backgroundColor: '#2c363c',
        paddingVertical: 8,
        alignSelf: 'flex-end',
        paddingHorizontal: 12,
        borderRadius: 10,
        width: '40%'
    },
    textAddCarrinho: {
        color: '#fff',
        fontWeight: 'bold'
    },
    acoesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
    },
    grupoQuantidade: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    grupoAcoesDireita: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonEditar: {
        backgroundColor: '#2c363c',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    buttonExcluir: {
        backgroundColor: '#e74c3c',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
});