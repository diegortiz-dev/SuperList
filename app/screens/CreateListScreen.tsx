import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SalvarItem, salvarLista, Item, DeletarItem, carregarListas } from '../src/services/storage';

const UNIDADES = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'pct'];

function formatarQtd(qty: number, unit?: string): string {
    const qtdStr = qty % 1 === 0 ? `${qty}` : `${qty}`.replace('.', ',');
    return unit ? `${qtdStr} ${unit}` : qtdStr;
}

type RootStackParamList = { Home: undefined, CreateListScreen: { listId?: string } | undefined, MyLists: undefined, ListDetails: { listId: string } };
type CreateListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateListScreen'>;
type CreateListScreenRouteProp = RouteProp<RootStackParamList, 'CreateListScreen'>;

export default function CreateListScreen() {
    const navigation = useNavigation<CreateListScreenNavigationProp>();
    const route = useRoute<CreateListScreenRouteProp>();
    const editListId = route.params?.listId;
    const isEditing = !!editListId;
    const [idLista] = useState(() => editListId ?? Date.now().toString());
    const [tituloLista, setTituloLista] = useState('');
    const [nomeItem, setNomeItem] = useState('');
    const [qtdItem, setQtdItem] = useState('');
    const [unitItem, setUnitItem] = useState('un');
    const [itens, setItens] = useState<Item[]>([]);
    const [listaCriada, setListaCriada] = useState(isEditing);

    useEffect(() => {
        if (isEditing) {
            carregarListas().then((listas) => {
                const lista = listas.find((l) => l.id === editListId);
                if (lista) {
                    setTituloLista(lista.title);
                    setItens(lista.itens);
                }
            });
        }
    }, [editListId, isEditing]);

    async function adicionarItem() {
        const nome = nomeItem.trim();
        const quantidade = Number(qtdItem.replace(',', '.'));
        if (!nome || Number.isNaN(quantidade) || quantidade <= 0) {
            return;
        }

        if (!listaCriada) {
            await salvarLista(idLista, tituloLista.trim() || 'Nova lista', [], new Date().toISOString());
            setListaCriada(true);
        }

        const novoItem = await SalvarItem(idLista, nome, quantidade, unitItem);
        setItens(prev => [...prev, novoItem]);
        setNomeItem('');
        setQtdItem('');
    }

    async function salvarListaFinal() {
        await salvarLista(idLista, tituloLista.trim() || 'Nova lista', itens, new Date().toISOString());
        navigation.goBack();

    }

function handleRemover(id: string) {
    Alert.alert('Remover', 'Deseja remover este item?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          DeletarItem(idLista, id).then(() => {
            setItens((prev) => prev.filter((i) => i.id !== id));
          });
        },
      },
    ]);
  }


function renderCard({ item }: { item: Item }) {
    return (
            <View style={styles.carditens}>
                <View style={styles.cardTextColumn}>
                        <Text style={styles.cardNome}>{item.name}</Text>
                        <Text style={styles.cardQtd}>Qtd: {formatarQtd(item.quantity, item.unit)}</Text>
                </View>
                    <TouchableOpacity
                        style={styles.cardCloseButton}
                        onPress={() => handleRemover(item.id)}
                         hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <Ionicons name="close-outline" size={30} color="#ff0000ff" />
                </TouchableOpacity>
            </View>
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
                        <Text style={styles.headerTitle}>{isEditing ? 'Editar Lista' : 'Nova Lista de Compras'}</Text>
                    </View>
                    <View style={styles.card}>

                        <Text style={styles.cardSectionTitle}>Informações da Lista</Text>

                        <Text style={styles.label}>Nome da Lista</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Compras do mês, Churrasco, feira"
                            value={tituloLista}
                            onChangeText={setTituloLista}
                        />
                        <View style={styles.divider} />
                        <Text style={styles.cardSectionTitle}>Adicionar Itens</Text>
                        <View style={styles.row}>
                            <View style={styles.productColumn}>
                                <Text style={styles.label}>Produto</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Arroz, feijão, Carne"
                                    value={nomeItem}
                                    onChangeText={setNomeItem}
                                />
                            </View>
                            <View style={styles.quantityColumn}>
                                <Text style={styles.label}>Qtd</Text>
                                <TextInput
                                    style={styles.inputSmall}
                                    placeholder="1"
                                    keyboardType="decimal-pad"
                                    value={qtdItem}
                                    onChangeText={setQtdItem}
                                />
                            </View>
                        </View>
                        <Text style={styles.label}>Unidade</Text>
                        <View style={styles.unitsRow}>
                            {UNIDADES.map((u) => (
                                <TouchableOpacity
                                    key={u}
                                    style={[styles.unitChip, unitItem === u && styles.unitChipSelected]}
                                    onPress={() => setUnitItem(u)}
                                >
                                    <Text style={[styles.unitChipText, unitItem === u && styles.unitChipTextSelected]}>{u}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.btn} onPress={adicionarItem}>
                            <Text style={styles.btnicone}>+   Adicionar</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.card}>

                        <Text style={styles.cardSectionTitle}>Itens ({itens.length})</Text>
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
                        <Text style={styles.footerButtonText}>{isEditing ? 'Salvar alterações' : 'Salvar lista'}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    carditens: {
        backgroundColor: '#f0f7f0',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#d4e8d4',
    },
    cardTextColumn: {
        flex: 1,
        paddingRight: 12,
    },
    cardCloseButton: {
        padding: 4,
    },
    lista: {
        paddingBottom: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 16,
        width: '100%',
    },
    input: {
        fontSize: 15,
        color: '#333333',
        borderWidth: 1,
        borderColor: '#d0d0d0',
        marginBottom: 10,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        height: 48,
    },
    gobackbutton: {
        fontSize: 50,
        color: '#1a1a1a',
        marginBottom: 20,
    },
    cardNome: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a3d1a',
        marginBottom: 2,
    },
    cardQtd: {
        fontSize: 14,
        color: '#4a7a4a',
        fontWeight: '600',
    },
    container: {
        flex: 1,
        backgroundColor: '#ebebeb',
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginLeft: 12,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        paddingVertical: 18,
        paddingHorizontal: 20,
        width: '100%',
        maxWidth: 420,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginTop: 20,
        alignSelf: 'center',
    },
    cardSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'left',
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555555',
        marginBottom: 6,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'left',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
        fontWeight: '500',
    },
    buttonsContainer: {
        width: '100%',
        gap: 14,
    },
    btn: {
        backgroundColor: '#1b7a2b',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
        height: 56,
    },
    btnText: {
        fontSize: 18,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    btnicone: {
        fontSize: 18,
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
        backgroundColor: '#ebebeb',
        borderTopWidth: 1,
        borderTopColor: '#d0d0d0',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    footerButton: {
        backgroundColor: '#1b7a2b',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
    },
    footerButtonText: {
        fontSize: 18,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        marginBottom: 6,
    },
    productColumn: {
        flex: 3,
    },
    quantityColumn: {
        flex: 1,
    },
    inputSmall: {
        fontSize: 16,
        color: '#333333',
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: '#d0d0d0',
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        textAlign: 'center',
        marginBottom: 10,
        height: 48,
    },
    unitsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 6,
    },
    unitChip: {
        borderWidth: 1,
        borderColor: '#c8c8c8',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: '#f0f0f0',
    },
    unitChipSelected: {
        backgroundColor: '#1b7a2b',
        borderColor: '#1b7a2b',
    },
    unitChipText: {
        fontSize: 13,
        color: '#555555',
        fontWeight: 'bold',
    },
    unitChipTextSelected: {
        color: '#ffffff',
    },
})
