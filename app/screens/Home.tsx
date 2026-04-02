import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../src/styles';

type RootStackParamList = { Home: undefined, CreateListScreen: undefined, MyLists: undefined, ListDetails: { listId: string } };
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function Home() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const screenOpacity = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.94)).current;
    const buttonsTranslate = useRef(new Animated.Value(12)).current;
    const useNativeDriver = Platform.OS !== 'web';

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
            Animated.timing(buttonsTranslate, {
                toValue: 0,
                duration: 320,
                easing: Easing.out(Easing.cubic),
                useNativeDriver,
            }),
        ]).start();
    }, [cardScale, buttonsTranslate, screenOpacity, useNativeDriver]);

    return (
        <Animated.View style={[styles.container, { opacity: screenOpacity }]}> 
            <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}> 
               <Image
                   source={require('../../assets/iconefodastico.png')}
                   style={styles.icon}
               />
                <Text style={styles.title}>Lista de compras</Text>
                <Text style={styles.subtitle}>
                    Organize suas compras de forma{'\n'}simples
                </Text>

                
                <Animated.View style={[styles.buttonsContainer, { transform: [{ translateY: buttonsTranslate }] }]}> 
                    <TouchableOpacity
                        style={styles.btnCriar}
                        activeOpacity={0.8}
                        onPress={() => {navigation.navigate('CreateListScreen')}}
                    >
                        <Text style={styles.btnCriarIcon}>+</Text>
                        <Text style={styles.btnCriarText}>Criar nova lista</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.btnVer}
                        activeOpacity={0.8}
                        onPress={() => {navigation.navigate('MyLists')}}
                    >
                        <Text style={styles.btnVerIcon}>☰</Text>
                        <Text style={styles.btnVerText}>Ver Minhas Listas</Text>
                    </TouchableOpacity>
                </Animated.View> 
            </Animated.View> 
            <Text style={styles.creditos}>Feito por Diego Ortiz</Text>
        </Animated.View> 
    );
}

const styles = StyleSheet.create({
    icon: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        paddingVertical: 40,
        paddingHorizontal: 30,
        alignItems: 'center',
        width: '100%',
        maxWidth: 420,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 4,
        boxShadow: COLORS.shadow,
        height: 500,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 10,
      
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.muted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
        fontWeight: 'bold',
    },
    buttonsContainer: {
        width: '100%',
        gap: 14,

    },
    btnCriar: {
        backgroundColor: COLORS.cta,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        height: 80,
    },
    btnCriarIcon: {
        fontSize: 26,
        color: COLORS.onBrand,
        fontWeight: 'bold',
        marginRight: 24,
    },
    btnCriarText: {
        fontSize: 22,
        color: COLORS.onBrand,
        fontWeight: 'bold',
    },
    btnVer: {
        backgroundColor: COLORS.brand,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        height: 80,
    },
    btnVerIcon: {
        fontSize: 22,
        color: COLORS.onBrand,
        fontWeight: 'bold',
        marginRight: 10,
    },
    btnVerText: {
        fontSize: 22,
        color: COLORS.onBrand,
        fontWeight: 'bold',
    },
    creditos: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        marginTop: 20,
        fontSize: 14,
        color: COLORS.muted,
        alignSelf: 'center',
        textAlign: 'center',
        marginBottom: 18,
    },
});
