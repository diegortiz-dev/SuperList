import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Home from './screens/Home';
import CreateListScreen from './screens/CreateListScreen';
import MyLists from './screens/Mylists'
import ListDetails from './screens/ListDetails'



export type RootStackParamList = {
 Home: undefined,
 CreateListScreen: { listId?: string } | undefined,
 MyLists: undefined,
 ListDetails: { listId: string }
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#F9FAFB" />
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
        <Stack.Screen name="Home" component={Home}/>
        <Stack.Screen name="CreateListScreen" component={CreateListScreen}/>
        <Stack.Screen name="MyLists" component={MyLists}/>
        <Stack.Screen name="ListDetails" component={ListDetails}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}