import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Animated, Easing, Platform } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { carregarListas, Item, Lista, salvarLista } from '../src/services/storage';
import { COLORS } from '../src/styles';

type RootStackParamList = { Home: undefined, CreateListScreen: { listId?: string } | undefined, MyLists: undefined, ListDetails: { listId: string } };
type ListDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'ListDetails'>;
type ListDetailsRouteProp = RouteProp<RootStackParamList, 'ListDetails'>;

export default function ListDetails() {
	const navigation = useNavigation<ListDetailsNavigationProp>();
	const route = useRoute<ListDetailsRouteProp>();
	const { listId } = route.params;

	const [lista, setLista] = useState<Lista | null>(null);
	const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
	const screenOpacity = useRef(new Animated.Value(0)).current;
	const headerTranslate = useRef(new Animated.Value(-20)).current;
	const summaryScale = useRef(new Animated.Value(0.96)).current;
	const footerTranslate = useRef(new Animated.Value(24)).current;
	const itemAnimations = useRef<Record<string, Animated.Value>>({}).current;
	const useNativeDriver = Platform.OS !== 'web';

	const carregar = useCallback(async () => {
		const listas = await carregarListas();
		const encontrada = listas.find((l) => l.id === listId) ?? null;
		setLista(encontrada);
		if (encontrada) {
			setPriceInputs((prev) => {
				const next = { ...prev };
				encontrada.itens.forEach((item) => {
					if (next[item.id] === undefined) {
						next[item.id] = item.price ? formatarPrecoInput(item.price) : '';
					}
				});
				return next;
			});
		}
	}, [listId]);

	useFocusEffect(
		useCallback(() => {
			carregar();
		}, [carregar])
	);

	const itens = lista?.itens ?? [];
	const itensMarcados = useMemo(() => itens.filter((item) => item.completed).length, [itens]);
	const progresso = useMemo(() => (itens.length === 0 ? 0 : itensMarcados / itens.length), [itens, itensMarcados]);

	const totalPreco = useMemo(() => {
		return itens.reduce((acc, item) => {
			if (!item.price || item.price <= 0) return acc;
			return acc + item.price * item.quantity;
		}, 0);
	}, [itens]);

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
			Animated.spring(summaryScale, {
				toValue: 1,
				speed: 14,
				bounciness: 10,
				useNativeDriver,
			}),
			Animated.timing(footerTranslate, {
				toValue: 0,
				duration: 260,
				easing: Easing.out(Easing.cubic),
				useNativeDriver,
			}),
		]).start();
	}, [footerTranslate, headerTranslate, screenOpacity, summaryScale, useNativeDriver]);

	useEffect(() => {
		if (!itens.length) return;
		itens.forEach((item) => {
			if (!itemAnimations[item.id]) {
				itemAnimations[item.id] = new Animated.Value(0);
			}
		});
		const animations = itens.map((item, index) =>
			Animated.timing(itemAnimations[item.id], {
				toValue: 1,
				duration: 260,
				delay: index * 70,
				easing: Easing.out(Easing.exp),
				useNativeDriver,
			})
		);
		Animated.stagger(60, animations).start();
	}, [itemAnimations, itens, useNativeDriver]);

	function formatarQtd(qty: number, unit?: string): string {
		const qtdStr = qty % 1 === 0 ? `${qty}` : `${qty}`.replace('.', ',');
		return unit ? `${qtdStr} ${unit}` : qtdStr;
	}

	function formatarPrecoInput(valor: number) {
		return valor.toFixed(2).replace('.', ',');
	}

	function formatarPreco(valor: number) {
		return `R$ ${valor.toFixed(2).replace('.', ',')}`;
	}

	function salvarListaAtual(atualizacoes: Partial<Lista>) {
		if (!lista) return;
		const atualizada = { ...lista, ...atualizacoes };
		setLista(atualizada);
		salvarLista(atualizada.id, atualizada.title, atualizada.itens, atualizada.date, atualizada.completed);
	}

	function toggleItem(itemId: string) {
		const novosItens = itens.map((item) =>
			item.id !== itemId ? item : { ...item, completed: !item.completed }
		);
		salvarListaAtual({ itens: novosItens });
	}

	function atualizarPrecoTexto(itemId: string, texto: string) {
		setPriceInputs((prev) => ({ ...prev, [itemId]: texto }));
	}

	function salvarPreco(itemId: string) {
		const texto = priceInputs[itemId] ?? '';
		const normalizado = texto.replace(/[\sR$]/g, '').replace(',', '.');
		const valor = normalizado.length ? Number(normalizado) : NaN;
		const novosItens = itens.map((item) =>
			item.id !== itemId ? item : { ...item, price: Number.isNaN(valor) ? undefined : valor }
		);
		salvarListaAtual({ itens: novosItens });
	}

	function toggleFinalizar() {
		salvarListaAtual({ completed: !lista?.completed });
	}

	const finalizada = lista?.completed ?? false;

	return (
		<Animated.View style={[styles.container, { opacity: screenOpacity }]}> 
			{/* Header */}
			<Animated.View style={[styles.header, { transform: [{ translateY: headerTranslate }] }]}> 
				<TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
					<Ionicons name="arrow-back" size={28} color={COLORS.text} />
				</TouchableOpacity>

				<View style={styles.headerCenter}>
					<Text style={styles.headerTitle} numberOfLines={1}>{lista?.title ?? 'Lista'}</Text>
					<View style={[styles.badge, finalizada ? styles.badgeFinalizada : styles.badgeAtiva]}>
						<Text style={styles.badgeText}>{finalizada ? 'Finalizada' : 'Ativa'}</Text>
					</View>
				</View>

				<TouchableOpacity
					style={styles.editButton}
					onPress={() => navigation.navigate('CreateListScreen', { listId })}
				>
					<Ionicons name="pencil" size={16} color={COLORS.onBrand} />
					<Text style={styles.editButtonText}>Editar</Text>
				</TouchableOpacity>
			</Animated.View>

			
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

				
				<Animated.View style={[styles.summaryCard, { transform: [{ scale: summaryScale }] }]}> 
					<View style={styles.summaryRow}>
						<Text style={styles.summaryLabel}>Progresso da compra</Text>
						<Text style={styles.summaryValue}>{itensMarcados}/{itens.length} Itens</Text>
					</View>
					<View style={styles.progressTrack}>
						<View style={[styles.progressFill, { width: `${Math.round(progresso * 100)}%` as any }]} />
					</View>
					<View style={styles.summaryRowBottom}>
						<Text style={styles.totalLabel}>Total</Text>
						<Text style={styles.totalValue}>{totalPreco > 0 ? formatarPreco(totalPreco) : 'R$ 0,00'}</Text>
					</View>
				</Animated.View>

				
				<View style={styles.itemsCard}>
					{itens.length === 0 ? (
						<Text style={styles.emptyText}>Nenhum item adicionado.</Text>
					) : (
							itens.map((item, index) => (
								<Animated.View
									key={item.id}
									style={{
										opacity: itemAnimations[item.id] ?? screenOpacity,
										transform: [
											{
												translateY: (itemAnimations[item.id] ?? screenOpacity).interpolate({
													inputRange: [0, 1],
													outputRange: [12, 0],
												}),
											},
										],
									}}
								>
									<View
										style={[styles.itemRow, item.completed ? styles.itemRowCompleted : styles.itemRowDefault]}
									>
								<TouchableOpacity
									style={[styles.checkbox, item.completed && styles.checkboxChecked]}
									onPress={() => toggleItem(item.id)}
								>
									{item.completed && <Ionicons name="checkmark" size={16} color={COLORS.onBrand} />}
								</TouchableOpacity>

								<View style={styles.itemInfo}>
									<Text style={[styles.itemTitle, item.completed && styles.itemTitleCompleted]}>
										{item.name}
									</Text>
									<Text style={styles.itemSubtitle}>Quantidade: {formatarQtd(item.quantity, item.unit)}</Text>
									{item.completed && (
										<View style={styles.priceRow}>
											<Text style={styles.priceLabel}>Valor por unidade/kg</Text>
											<View style={styles.priceInputRow}>
												<Text style={styles.pricePrefix}>R$</Text>
												<TextInput
													style={styles.priceInput}
													keyboardType="decimal-pad"
													placeholder="0,00"
													value={priceInputs[item.id] ?? ''}
													onChangeText={(texto) => atualizarPrecoTexto(item.id, texto)}
													onEndEditing={() => salvarPreco(item.id)}
												/>
											</View>
										</View>
									)}
								</View>
								</View>
							</Animated.View>
						))
					)}
				</View>
			</ScrollView>

			
			<Animated.View style={[styles.footer, { transform: [{ translateY: footerTranslate }] }]}> 
				<TouchableOpacity
					style={[styles.footerButton, finalizada ? styles.footerButtonReativar : styles.footerButtonFinalizar]}
					onPress={toggleFinalizar}
				>
					<Ionicons
						name={finalizada ? 'refresh-outline' : 'checkmark-done-outline'}
						size={20}
						color={COLORS.onBrand}
					/>
					<Text style={styles.footerButtonText}>
						{finalizada ? 'Reativar Lista' : 'Finalizar Lista'}
					</Text>
				</TouchableOpacity>
			</Animated.View>
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
		marginTop: 20,
		marginBottom: 16,
		gap: 10,
	},
	headerCenter: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		overflow: 'hidden',
	},
	headerTitle: {
		fontSize: 20,
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
	editButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.cta,
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		gap: 6,
		height: 50,
		width: 90,
		justifyContent: 'center',
	},
	editButtonText: {
		fontSize: 13,
		color: COLORS.onBrand,
		fontWeight: 'bold',
	},
	content: {
		paddingBottom: 100,
		gap: 16,
	},
	summaryCard: {
		backgroundColor: COLORS.surface,
		borderRadius: 14,
		padding: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	summaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	summaryLabel: {
		fontSize: 14,
		color: COLORS.text,
		fontWeight: 'bold',
	},
	summaryValue: {
		fontSize: 14,
		color: COLORS.text,
		fontWeight: 'bold',
	},
	progressTrack: {
		height: 8,
		backgroundColor: COLORS.border,
		borderRadius: 8,
		overflow: 'hidden',
		marginBottom: 12,
	},
	progressFill: {
		height: '100%',
		backgroundColor: COLORS.brand,
		borderRadius: 8,
	},
	summaryRowBottom: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	totalLabel: {
		fontSize: 14,
		color: COLORS.text,
		fontWeight: 'bold',
	},
	totalValue: {
		fontSize: 18,
		color: COLORS.cta,
		fontWeight: 'bold',
	},
	itemsCard: {
		backgroundColor: COLORS.surface,
		borderRadius: 14,
		padding: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	itemRow: {
		flexDirection: 'row',
		gap: 12,
		padding: 12,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: COLORS.border,
		marginBottom: 10,
	},
	itemRowCompleted: {
		backgroundColor: COLORS.successSoft,
	},
	itemRowDefault: {
		backgroundColor: COLORS.surface,
	},
	checkbox: {
		width: 45,
		height: 45,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: COLORS.border,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.surface,
	},
	checkboxChecked: {
		backgroundColor: COLORS.cta,
		borderColor: COLORS.cta,
	},
	itemInfo: {
		flex: 1,
	},
	itemTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: 4,
	},
	itemTitleCompleted: {
		textDecorationLine: 'line-through',
		color: COLORS.muted,
	},
	itemSubtitle: {
		fontSize: 14,
		color: COLORS.muted,
		marginBottom: 4,
	},
	priceRow: {
		gap: 6,
		marginTop: 4,
	},
	priceLabel: {
		fontSize: 12,
		color: COLORS.text,
		fontWeight: 'bold',
	},
	priceInputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.background,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: COLORS.border,
		paddingHorizontal: 8,
		paddingVertical: 6,
		gap: 6,
		height: 45,
	},
	pricePrefix: {
		fontSize: 14,
		color: COLORS.muted,
		fontWeight: 'bold',
	},
	priceInput: {
		flex: 1,
		fontSize: 14,
		color: COLORS.text,
		fontWeight: 'bold',
		padding: 0,
	},
	emptyText: {
		fontSize: 14,
		color: COLORS.muted,
		textAlign: 'center',
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
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	footerButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 14,
		paddingVertical: 16,
		gap: 10,
	},
	footerButtonFinalizar: {
		backgroundColor: COLORS.cta,
	},
	footerButtonReativar: {
		backgroundColor: COLORS.muted,
	},
	footerButtonText: {
		fontSize: 18,
		color: COLORS.onBrand,
		fontWeight: 'bold',
	},
});
