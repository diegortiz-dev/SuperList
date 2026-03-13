import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = { Home: undefined, CreateListScreen: undefined, MyLists: undefined, ListDetails: { listId: string } };
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function Home() {
    const navigation = useNavigation<HomeScreenNavigationProp>();

    return (
        <View style={styles.container}>
            <View style={styles.card}>
               <Image
                   source={require('../../assets/iconefodastico.png')}
                   style={styles.icon}
               />
                <Text style={styles.title}>Lista de compras</Text>
                <Text style={styles.subtitle}>
                    Organize suas compras de forma{'\n'}simples
                </Text>

                
                <View style={styles.buttonsContainer}>
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
                </View>
            </View>
            <Text style={styles.creditos}>Feito por Diego Ortiz</Text>
        </View>
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
        backgroundColor: '#ebebeb',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        paddingVertical: 40,
        paddingHorizontal: 30,
        alignItems: 'center',
        width: '100%',
        maxWidth: 420,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        height: 500,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
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
    btnCriar: {
        backgroundColor: '#1b7a2b',
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
        color: '#ffffff',
        fontWeight: 'bold',
        marginRight: 24,
    },
    btnCriarText: {
        fontSize: 22,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    btnVer: {
        backgroundColor: '#ff751f',
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
        color: '#ffffff',
        fontWeight: 'bold',
        marginRight: 10,
    },
    btnVerText: {
        fontSize: 22,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    creditos: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        marginTop: 20,
        fontSize: 14,
        color: '#656565ff',
        alignSelf: 'center',
        textAlign: 'center',
        marginBottom: 18,
    },
});
