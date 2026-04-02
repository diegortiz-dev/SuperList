import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TouchableWithoutFeedback, Animated, Easing, Platform, useWindowDimensions } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { carregarListas, Lista, DeletarLista, CopiarLista } from '../src/services/storage';
import { COLORS } from '../src/styles';

const MENU_WIDTH = 170;
const MENU_HEIGHT = 160;
const MENU_MARGIN = 8;

type RootStackParamList = {
  Home: undefined,
  CreateListScreen: { listId?: string } | undefined,
  MyLists: undefined,
  ListDetails: { listId: string }
};

type MyListsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyLists'>;

export default function MyLists() {

    const navigation = useNavigation<MyListsScreenNavigationProp>();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const [listas, setListas] = useState<Lista[]>([]);
    const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
    const [openedMenuId, setOpenedMenuId] = useState<string | null>(null);
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
    const menuRefs = useRef<Record<string, View | null>>({});
    const screenOpacity = useRef(new Animated.Value(0)).current;
    const headerTranslate = useRef(new Animated.Value(-30)).current;
    const ctaScale = useRef(new Animated.Value(0.9)).current;
    const cardAnimations = useRef<Record<string, Animated.Value>>({}).current;
    const useNativeDriver = Platform.OS !== 'web';

    const carregar = useCallback(async () => {
        const resultado = await carregarListas();
        setListas(resultado);
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(screenOpacity, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver,
            }),
            Animated.spring(headerTranslate, {
                toValue: 0,
                speed: 14,
                bounciness: 10,
                useNativeDriver,
            }),
            Animated.spring(ctaScale, {
                toValue: 1,
                speed: 12,
                bounciness: 12,
                useNativeDriver,
            }),
        ]).start();
    }, [ctaScale, headerTranslate, screenOpacity, useNativeDriver]);

    useFocusEffect(
        useCallback(() => {
            carregar();
        }, [carregar])
    );

    useEffect(() => {
        if (!listas.length) return;

        listas.forEach((lista) => {
            if (!cardAnimations[lista.id]) {
                cardAnimations[lista.id] = new Animated.Value(0);
            }
        });

        const animations = listas.map((lista, index) =>
            Animated.timing(cardAnimations[lista.id], {
                toValue: 1,
                duration: 320,
                delay: index * 70,
                easing: Easing.out(Easing.exp),
                useNativeDriver,
            })
        );

        Animated.stagger(60, animations).start();
    }, [cardAnimations, listas, useNativeDriver]);

    function formatarData(dataIso: string) {
        const data = new Date(dataIso);
        if (Number.isNaN(data.getTime())) return '';
        return data.toLocaleDateString('pt-BR');
    }

    function formatarPreco(total: number) {
        return `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    function calcularTotalPreco(lista: Lista) {
        const total = lista.itens.reduce((acc, item) => {
            if (!item.price || item.price <= 0) return acc;
            return acc + item.price * item.quantity;
        }, 0);
        return total > 0 ? formatarPreco(total) : '';
    }

    function contarMarcados(lista: Lista) {
        return lista.itens.filter((item) => item.completed).length;
    }

    function limitarPosicaoMenu(anchorX: number, anchorTop: number, anchorBottom: number) {
        const left = Math.min(
            Math.max(anchorX - MENU_WIDTH, MENU_MARGIN),
            screenWidth - MENU_WIDTH - MENU_MARGIN
        );

        const espacoAbaixo = screenHeight - anchorBottom - MENU_MARGIN;
        const espacoAcima = anchorTop - MENU_MARGIN;
        const abreAcima = espacoAbaixo < MENU_HEIGHT && espacoAcima > espacoAbaixo;

        const topPreferido = abreAcima ? anchorTop - MENU_HEIGHT : anchorBottom;

        const top = Math.min(
            Math.max(topPreferido, MENU_MARGIN),
            screenHeight - MENU_HEIGHT - MENU_MARGIN
        );

        return { x: left, y: top };
    }

    function openMenu(id: string) {
        const ref = menuRefs.current[id];
        if (!ref) return;
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
            (document.activeElement as HTMLElement | null)?.blur();
        }
        ref.measure((_fx, _fy, width, height, px, py) => {
            setMenuPos(limitarPosicaoMenu(px + width, py, py + height));
            setOpenedMenuId(id);
        });
    }

    function closeMenu() {
        setOpenedMenuId(null);
    }

    async function handleCopy(id: string) {
        closeMenu();
        await CopiarLista(id);
        carregar();
    }

    async function handleDelete(id: string) {
        closeMenu();
        Alert.alert(
            'Excluir lista',
            'Tem certeza que deseja excluir esta lista?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        await DeletarLista(id);
                        carregar();
                    }
                }
            ]
        );
    }

    const menuLista = listas.find((l) => l.id === openedMenuId);
    const listasOrdenadas = useMemo(() => {
        const copia = [...listas];
        copia.sort((a, b) => {
            const dataA = new Date(a.date).getTime();
            const dataB = new Date(b.date).getTime();
            const valorA = Number.isNaN(dataA) ? 0 : dataA;
            const valorB = Number.isNaN(dataB) ? 0 : dataB;
            return sortOrder === 'recent' ? valorB - valorA : valorA - valorB;
        });
        return copia;
    }, [listas, sortOrder]);

    return (

        <Animated.View style={[styles.container, { opacity: screenOpacity }]}> 

            <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslate }] }]}> 

                <View style={styles.headerLeft}>

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color={COLORS.text} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Minhas Listas</Text>

                </View>

                <TouchableOpacity
                    style={[styles.headerButton, { transform: [{ scale: ctaScale }] }]}
                    onPress={() => navigation.navigate('CreateListScreen')}
                >
                    <Ionicons name="cart" size={18} color={COLORS.onBrand} />
                    <Text style={styles.headerButtonText}>Nova Lista</Text>
                </TouchableOpacity>

            </Animated.View>

            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterButton, sortOrder === 'recent' && styles.filterButtonActive]}
                    onPress={() => setSortOrder('recent')}
                    activeOpacity={0.85}
                >
                    <Text style={[styles.filterButtonText, sortOrder === 'recent' && styles.filterButtonTextActive]}>
                        Mais recentes
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterButton, sortOrder === 'oldest' && styles.filterButtonActive]}
                    onPress={() => setSortOrder('oldest')}
                    activeOpacity={0.85}
                >
                    <Text style={[styles.filterButtonText, sortOrder === 'oldest' && styles.filterButtonTextActive]}>
                        Mais antigas
                    </Text>
                </TouchableOpacity>
            </View>

            <Animated.ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={closeMenu}
            >

                {listas.length === 0 && (
                    <Animated.View style={[styles.emptyState, { opacity: screenOpacity }]}> 
                        <Ionicons name="cart-outline" size={64} color={COLORS.muted} />
                        <Text style={styles.emptyTitle}>Nenhuma lista ainda</Text>
                        <Text style={styles.emptySubtitle}>Crie sua primeira lista de compras tocando em "Nova Lista"</Text>
                    </Animated.View>
                )}

                {listasOrdenadas.map((lista) => (

                    <Animated.View
                        key={lista.id}
                        style={{
                            transform: [
                                {
                                    translateY: (cardAnimations[lista.id] ?? screenOpacity).interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [14, 0],
                                    }),
                                },
                            ],
                            opacity: (cardAnimations[lista.id] ?? screenOpacity),
                        }}
                    >
                        <TouchableOpacity
                            style={styles.listCard}
                            activeOpacity={0.85}
                            onPress={() => { closeMenu(); navigation.navigate('ListDetails', { listId: lista.id }); }}
                        >

                            <View style={styles.cardTopRow}>

                                <View style={styles.cardTitleRow}>

                                    <Text style={styles.listTitle} numberOfLines={1}>
                                        {lista.title}
                                    </Text>

                                    <View style={[styles.badge, lista.completed ? styles.badgeFinalizada : styles.badgeAtiva]}>
                                        <Text style={styles.badgeText}>{lista.completed ? 'Finalizada' : 'Ativa'}</Text>
                                    </View>

                                </View>

                                <View
                                    ref={(r) => { menuRefs.current[lista.id] = r; }}
                                    collapsable={false}
                                >
                                    <TouchableOpacity
                                        onPress={(e) => { e.stopPropagation(); openMenu(lista.id); }}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="ellipsis-vertical" size={18} color={COLORS.text} />
                                    </TouchableOpacity>
                                </View>

                            </View>

                            <Text style={styles.listDate}>
                                Criada em {formatarData(lista.date)}
                            </Text>

                            <View style={styles.cardBottomRow}>

                                <Text style={styles.listProgress}>
                                    {contarMarcados(lista)}/{lista.itens.length} Itens marcados
                                </Text>

                                {!!calcularTotalPreco(lista) && (

                                    <Text style={styles.listPrice}>
                                        {calcularTotalPreco(lista)}
                                    </Text>

                                )}

                            </View>

                        </TouchableOpacity>
                    </Animated.View>

                ))}

            </Animated.ScrollView>

        
            <Modal
                visible={openedMenuId !== null}
                transparent
                animationType="none"
                onRequestClose={closeMenu}
            >
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.menuContainer, { top: menuPos.y, left: menuPos.x }]}> 

                                <TouchableOpacity
                                    style={styles.menuButton}
                                    onPress={() => {
                                        closeMenu();
                                        if (menuLista) navigation.navigate('CreateListScreen', { listId: menuLista.id });
                                    }}
                                >
                                    <Ionicons name="pencil-outline" size={15} color={COLORS.text} />
                                    <Text style={styles.menuButtonText}>Editar Lista</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuButton}
                                    onPress={() => menuLista && handleCopy(menuLista.id)}
                                >
                                    <Ionicons name="copy-outline" size={15} color={COLORS.text} />
                                    <Text style={styles.menuButtonText}>Copiar Lista</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.menuButton, styles.menuButtonLast]}
                                    onPress={() => menuLista && handleDelete(menuLista.id)}
                                >
                                    <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
                                    <Text style={[styles.menuButtonText, styles.menuButtonTextDanger]}>Excluir Lista</Text>
                                </TouchableOpacity>

                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </Animated.View>

    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        color: COLORS.text,
        marginLeft: 10,
    },

    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cta,
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        gap: 6,
        height: 50,
        marginTop: 10,
    },

    headerButtonText: {
        fontSize: 14,
        color: COLORS.onBrand,
        fontWeight: 'bold',
    },

    filterRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
    },

    filterButton: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 10,
        alignItems: 'center',
    },

    filterButtonActive: {
        backgroundColor: COLORS.brand,
        borderColor: COLORS.brand,
    },

    filterButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.text,
    },

    filterButtonTextActive: {
        color: COLORS.onBrand,
    },

    content: {
        paddingBottom: 20,
        gap: 16,
    },

    listCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },

    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        overflow: 'hidden',
    },

    modalBackdrop: {
        flex: 1,
    },

    menuContainer: {
        position: 'absolute',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        overflow: 'hidden',
        width: MENU_WIDTH,
        elevation: 12,
        boxShadow: COLORS.shadow,
    },

    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },

    menuButtonLast: {
        borderBottomWidth: 0,
    },

    menuButtonText: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 14,
    },

    menuButtonTextDanger: {
        color: COLORS.danger,
    },

    listTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.text,
        flexShrink: 1,
    },

    badge: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },

    badgeAtiva: {
        backgroundColor: COLORS.brand,
    },

    badgeFinalizada: {
        backgroundColor: COLORS.muted,
    },

    badgeText: {
        fontSize: 11,
        color: COLORS.onBrand,
        fontWeight: 'bold',
    },

    listDate: {
        fontSize: 12,
        color: COLORS.muted,
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
        color: COLORS.text,
    },

    listPrice: {
        fontSize: 16,
        color: COLORS.cta,
        fontWeight: 'bold',
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 8,
    },

    emptySubtitle: {
        fontSize: 14,
        color: COLORS.muted,
        textAlign: 'center',
        lineHeight: 20,
    },

});