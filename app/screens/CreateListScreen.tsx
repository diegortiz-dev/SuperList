import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Alert, Animated, Easing } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SalvarItem, salvarLista, Item, DeletarItem, carregarListas } from '../src/services/storage';
import { COLORS } from '../src/styles';

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
    const screenOpacity = useRef(new Animated.Value(0)).current;
    const headerTranslate = useRef(new Animated.Value(-20)).current;
    const cardScale = useRef(new Animated.Value(0.96)).current;
    const footerTranslate = useRef(new Animated.Value(24)).current;
    const useNativeDriver = Platform.OS !== 'web';
    const quantidadeAtual = Number(qtdItem.replace(',', '.'));
    const podeAdicionarItem = nomeItem.trim().length > 0 && !Number.isNaN(quantidadeAtual) && quantidadeAtual > 0;
    const podeSalvarLista = itens.length > 0;

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

    useEffect(() => {
        Animated.parallel([
            Animated.timing(screenOpacity, {
                toValue: 1,
                duration: 320,
                easing: Easing.out(Easing.ease),
                useNativeDriver,
            }),
            Animated.spring(cardScale, {
                toValue: 1,
                speed: 14,
                bounciness: 10,
                useNativeDriver,
            }),
            Animated.spring(headerTranslate, {
                toValue: 0,
                speed: 14,
                bounciness: 10,
                useNativeDriver,
            }),
            Animated.timing(footerTranslate, {
                toValue: 0,
                duration: 280,
                easing: Easing.out(Easing.cubic),
                useNativeDriver,
            }),
        ]).start();
    }, [cardScale, footerTranslate, headerTranslate, screenOpacity, useNativeDriver]);

    async function adicionarItem() {
        const nome = nomeItem.trim();
        const quantidade = Number(qtdItem.replace(',', '.'));
        if (!nome) {
            Alert.alert('Produto obrigatório', 'Digite o nome do item para adicionar.');
            return;
        }

        if (Number.isNaN(quantidade) || quantidade <= 0) {
            Alert.alert('Quantidade inválida', 'Digite uma quantidade maior que zero.');
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
        if (!podeSalvarLista) {
            Alert.alert('Lista vazia', 'Adicione pelo menos um item antes de salvar a lista.');
            return;
        }

        await salvarLista(idLista, tituloLista.trim() || 'Nova lista', itens, new Date().toISOString());
        navigation.goBack();

    }

    function handleQtdChange(text: string) {
        const normalizado = text.replace(',', '.');
        if (!/^\d*\.?\d*$/.test(normalizado)) {
            return;
        }
        setQtdItem(text.replace('.', ','));
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
                        <Ionicons name="close-outline" size={30} color={COLORS.danger} />
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
                <Animated.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ opacity: screenOpacity }}>
                    <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslate }] }]}> 
                        <TouchableOpacity onPress={() => {navigation.goBack()}}>
                            <Ionicons name="arrow-back" size={32} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{isEditing ? 'Editar Lista' : 'Nova Lista de Compras'}</Text>
                    </Animated.View>
                    <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}> 

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
                                    onChangeText={handleQtdChange}
                                    returnKeyType="done"
                                    onSubmitEditing={adicionarItem}
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
                        <TouchableOpacity
                            style={[styles.btn, !podeAdicionarItem && styles.btnDisabled]}
                            onPress={adicionarItem}
                            disabled={!podeAdicionarItem}
                            activeOpacity={podeAdicionarItem ? 0.8 : 1}
                        >
                            <Text style={styles.btnicone}>+   Adicionar</Text>
                        </TouchableOpacity>
                    </Animated.View>
                    <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}> 

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

                    </Animated.View>
                </Animated.ScrollView>

                <Animated.View style={[styles.footer, { transform: [{ translateY: footerTranslate }] }]}> 
                    <TouchableOpacity
                        style={[styles.footerButton, !podeSalvarLista && styles.footerButtonDisabled]}
                        onPress={salvarListaFinal}
                        disabled={!podeSalvarLista}
                        activeOpacity={podeSalvarLista ? 0.8 : 1}
                    >
                        <Text style={styles.footerButtonText}>{isEditing ? 'Salvar alterações' : 'Salvar lista'}</Text>
                    </TouchableOpacity>
                </Animated.View> 
            </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    carditens: {
        backgroundColor: COLORS.successSoft,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.successBorder,
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
        backgroundColor: COLORS.border,
        marginVertical: 16,
        width: '100%',
    },
    input: {
        fontSize: 15,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 10,
        padding: 12,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        height: 48,
    },
    gobackbutton: {
        fontSize: 50,
        color: COLORS.text,
        marginBottom: 20,
    },
    cardNome: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    cardQtd: {
        fontSize: 14,
        color: COLORS.muted,
        fontWeight: '600',
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        color: COLORS.text,
        marginLeft: 12,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        paddingVertical: 18,
        paddingHorizontal: 20,
        width: '100%',
        maxWidth: 420,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 3,
        boxShadow: COLORS.shadow,
        marginTop: 20,
        alignSelf: 'center',
    },
    cardSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'left',
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.muted,
        marginBottom: 6,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'left',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.muted,
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
        backgroundColor: COLORS.cta,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
        height: 56,
    },
    btnDisabled: {
        backgroundColor: COLORS.ctaDisabled,
    },
    btnText: {
        fontSize: 18,
        color: COLORS.onBrand,
        fontWeight: 'bold',
    },
    btnicone: {
        fontSize: 18,
        color: COLORS.onBrand,
        fontWeight: 'bold',
    },
    btnSecondary: {
        backgroundColor: COLORS.brand,
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
        color: COLORS.onBrand,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    footerButton: {
        backgroundColor: COLORS.cta,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
    },
    footerButtonDisabled: {
        backgroundColor: COLORS.ctaDisabled,
    },
    footerButtonText: {
        fontSize: 18,
        color: COLORS.onBrand,
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
        color: COLORS.text,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 10,
        backgroundColor: COLORS.surface,
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
        borderColor: COLORS.border,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: COLORS.surface,
        width: 55,
        height: 45,
        justifyContent: 'center',

    },
    unitChipSelected: {
        backgroundColor: COLORS.brand,
        borderColor: COLORS.brand,
    },
    unitChipText: {
        fontSize: 15,
        color: COLORS.muted,
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    unitChipTextSelected: {
        color: COLORS.onBrand,
    },
})
