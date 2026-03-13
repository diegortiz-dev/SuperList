import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {Ionicons} from '@expo/vector-icons'
import { carregarListas, Lista } from '../src/services/storage';

type RootStackParamList = { Home: undefined, CreateListScreen: undefined, MyLists: undefined };
type MyListsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyLists'>;

export default function MyLists() {
    const navigation = useNavigation<MyListsScreenNavigationProp>();
    const [listas, setListas] = useState<Lista[]>([]);

    const carregar = useCallback(async () => {
        const resultado = await carregarListas();
        setListas(resultado);
    }, []);

    useFocusEffect(
        useCallback(() => {
            carregar();
        }, [carregar])
    );

    function formatarData(dataIso: string) {
        const data = new Date(dataIso);
        if (Number.isNaN(data.getTime())) {
            return '';
        }
        return data.toLocaleDateString('pt-BR');
    }

    function formatarPreco(total: number) {
        const valor = total.toFixed(2).replace('.', ',');
        return `R$ ${valor}`;
    }

    function calcularTotalPreco(lista: Lista) {
        const total = lista.itens.reduce((acc, item) => {
            if (!item.price || item.price <= 0) {
                return acc;
            }
            return acc + item.price * item.quantity;
        }, 0);
        return total > 0 ? formatarPreco(total) : '';
    }

    function contarMarcados(lista: Lista) {
        return lista.itens.filter((item) => item.completed).length;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => {navigation.goBack()}}>
                        <Ionicons name="arrow-back" size={28} color="#000000ff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Minhas Listas</Text>
                </View>
                <TouchableOpacity style={styles.headerButton} onPress={() => {navigation.navigate('CreateListScreen')}}>
                    <Ionicons name="cart" size={18} color="#ffffff" />
                    <Text style={styles.headerButtonText}>Nova Lista</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {listas.map((lista) => (
                    <View key={lista.id} style={styles.listCard}>
                        <View style={styles.cardTopRow}>
                            <View style={styles.cardTitleRow}>
                                <Text style={styles.listTitle}>{lista.title}</Text>
                                {!lista.completed && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>Ativa</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity>
                                <Ionicons name="ellipsis-vertical" size={18} color="#111111" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.listDate}>Criada em {formatarData(lista.date)}</Text>

                        <View style={styles.cardBottomRow}>
                            <Text style={styles.listProgress}>{contarMarcados(lista)}/{lista.itens.length} Itens marcados</Text>
                            {!!calcularTotalPreco(lista) && <Text style={styles.listPrice}>{calcularTotalPreco(lista)}</Text>}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d5d5d5',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginTop: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginLeft: 10,
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1b7a2b',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        gap: 6,
        height:50,
        marginTop: 10,
    },
    headerButtonText: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    content: {
        paddingBottom: 20,
        gap: 16,
    },
    listCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#8f8f8f',
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    badge: {
        backgroundColor: '#0a7a38',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    badgeText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    listDate: {
        fontSize: 12,
        color: '#8f8f8f',
        marginTop: 4,
    },
    cardBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    listProgress: {
        fontSize: 14,
        color: '#3d3d3d',
    },
    listPrice: {
        fontSize: 16,
        color: '#2f7d32',
        fontWeight: 'bold',
    },
})
