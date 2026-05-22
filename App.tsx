import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import Home from "./src/screens/Home";
import Categorias from "./src/screens/Categorias";
import Estoque from "./src/screens/Estoque";
import Fornecedores from "./src/screens/Fornecedores";


export type RootStackParamList = {
  Home: undefined,  
  Fornecedores: undefined,
  Categorias: undefined,
  Estoque: undefined,
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
            name="Categorias"
            component={Categorias}
          />
        <Stack.Screen
          name="Estoque"
          component={Estoque}
        />
                <Stack.Screen
          name="Fornecedores"
          component={Fornecedores}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
