import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {Ionicons} from '@expo/vector-icons'
import { SalvarItem, salvarLista, Item } from '../src/services/storage';

type RootStackParamList = { Home: undefined, CreateListScreen: undefined, MyLists: undefined };
type CreateListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateListScreen'>;

export default function CreateListScreen() {
    const navigation = useNavigation<CreateListScreenNavigationProp>();
    const [idLista] = useState(() => Date.now().toString());
    const [tituloLista, setTituloLista] = useState('');
    const [nomeItem, setNomeItem] = useState('');
    const [qtdItem, setQtdItem] = useState('');
    const [itens, setItens] = useState<Item[]>([]);
    const [listaCriada, setListaCriada] = useState(false);

    async function adicionarItem() {
        const nome = nomeItem.trim();
        const quantidade = Number(qtdItem);
        if (!nome || Number.isNaN(quantidade) || quantidade <= 0) {
            return;
        }

        if (!listaCriada) {
            await salvarLista(idLista, tituloLista.trim() || 'Nova lista', [], new Date().toISOString());
            setListaCriada(true);
        }

        const novoItem = await SalvarItem(idLista, nome, quantidade);
        setItens(prev => [...prev, novoItem]);
        setNomeItem('');
        setQtdItem('');
    }

    async function salvarListaFinal() {
        await salvarLista(idLista, tituloLista.trim() || 'Nova lista', itens, new Date().toISOString());
        navigation.goBack();

    }

function renderCard({ item }: { item: Item }) {
    return (
      <TouchableOpacity
        style={styles.carditens}
        onPress={() => {}}
      >
        <Text style={styles.cardNome}>{item.name}</Text>
        <Text style={styles.cardQtd}>Qtd: {item.quantity}</Text>
      </TouchableOpacity>
    );
}

    return (
            
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => {navigation.goBack()}}>
                            <Ionicons name="arrow-back" size={32} color="#000000ff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Nova Lista de Compras</Text>
                    </View>
                    <View style={styles.card}>

                        <Text style={styles.title}>Informações da Lista</Text>

                        <Text style={styles.title}>Nome da Lista</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Compras do mês, Churrasco, feira"
                            value={tituloLista}
                            onChangeText={setTituloLista}
                        />
                        <View style={styles.divider} />
                        <Text style={styles.title}>Adicionar Itens</Text>
                        <View style={styles.row}>
                            <View style={styles.productColumn}>
                                <Text style={styles.title}>Produto</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex:Arroz , feijão, Carne"
                                    value={nomeItem}
                                    onChangeText={setNomeItem}
                                />
                            </View>
                            <View style={styles.quantityColumn}>
                                <Text style={styles.title}>Qtd</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    placeholder="1"
                                    keyboardType="numeric"
                                    value={qtdItem}
                                    onChangeText={setQtdItem}
                                />
                            </View>
                        </View>
                        <TouchableOpacity style={styles.btn} onPress={adicionarItem}>
                            <Text style={styles.btnicone}>+   Adicionar</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.card}>

                        <Text style={styles.title}>Itens({itens.length}) </Text>
                        {itens.length === 0 ? (
                    <Text style={styles.subtitle}>Nenhum item adicionado ainda.</Text>
                ) : (
                    <FlatList
                    data={itens}
                    keyExtractor={(item: Item) => item.id}
                    renderItem={renderCard}
                    contentContainerStyle={styles.lista}
                    scrollEnabled={false}
                    />
                )}

                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.footerButton} onPress={salvarListaFinal}>
                        <Text style={styles.footerButtonText}>Salvar lista</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    carditens: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 6,
    },

    lista: {
        paddingBottom: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#cccccc',
        marginVertical: 20,
        width: '100%',
    },
    input: {
        fontSize: 16,
        color: '#6b6b6bff',
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: '#cccccc',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#d1d1d1',
        borderRadius: 18,
        height: 45,
    },
    gobackbutton: {
        fontSize: 50,
        color: '#1a1a1a',
        marginBottom: 20,
    },
    cardNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cardQtd: {
        fontSize: 16,
        color: '#555',
    },
    container: {
        flex: 1,
        backgroundColor: '#d5d5d5',
        padding: 20,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 10,
        marginTop: 10,
    },
    headerTitle: {
        marginTop: 10,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginLeft: 12,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 20,
        width: '100%',
        maxWidth: 420,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        maxHeight: 500,
        minHeight: 200,
        marginTop: 28,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'left',
        marginBottom: 10,
      
    },
    subtitle: {
        fontSize: 15,
        color: '#656565ff',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
        fontWeight: 'bold',
    },
    buttonsContainer: {
        width: '100%',
        gap: 14,

    },
    btn: {
        backgroundColor: '#1b7a2b',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        height:60,
    },
    btnText: {
        fontSize: 22,
        color: '#ffffff',
        fontWeight: 'bold',
        marginRight: 24,
    },
    btnicone: {
        fontSize: 22,
        color: '#ffffff',
        fontWeight: 'bold',
    
    },
    btnSecondary: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        height: 60,
    },
    btnSecondaryText: {
        fontSize: 20,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#d5d5d5',
        borderTopWidth: 1,
        borderTopColor: '#bcbcbc',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    footerButton: {
        backgroundColor: '#1b7a2b',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    },
    footerButtonText: {
        fontSize: 20,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        marginBottom: 10,
    },
    productColumn: {
        flex: 3,
    },
    quantityColumn: {
        flex: 1,
    },
    inputSmall: {
        fontSize: 16,
        color: '#6b6b6bff',
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 10,
        backgroundColor: '#d1d1d1',
        borderRadius: 18,
        textAlign: 'center',
        marginBottom: 10,
        height: 45,
    },
})
