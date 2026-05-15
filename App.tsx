import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Produto } from "./src/screens/produtos";

import Home from "./src/screens/Home";
import Produtos from "./src/screens/produtos";
import Categorias from "./src";


export type RootStackParamList = {
  Home: undefined,
  Produtos: undefined,
  Categorias: undefined,
  NovoProd: undefined,
  NovaCat: undefined,
}

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Produtos"
          component={Produtos}
        />
        <Stack.Screen
          name="Categorias"
          component={Categorias}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
