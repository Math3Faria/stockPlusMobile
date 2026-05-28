import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import Home from "./src/screens/Home";
import Categorias from "./src/screens/Categorias";
import Estoque from "./src/screens/Estoque";
import Fornecedores from "./src/screens/Fornecedores";
import Login from "./src/screens/Login";
import Cadastro from "./src/screens/Cadastro";
import AlertaEstoque from "./src/screens/AlertaEstoque";
import AlertaVencimento from "./src/screens/AlertaVencimento";
import Movimentacoes from "./src/screens/Movimentacoes";


export type RootStackParamList = {
  Home: undefined;
  Estoque: undefined;
  Categorias: undefined;
  Fornecedores: undefined;
  Login: undefined;
  Cadastro: undefined;
  AlertaEstoque: undefined;
  AlertaVencimento: undefined;
  Movimentacoes: undefined;
};

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
        <Stack.Screen 
        name="Login"
         component={Login}
        />

        <Stack.Screen 
        name="Cadastro" 
        component={Cadastro} 
        />
        <Stack.Screen 
        name="AlertaEstoque" 
        component={AlertaEstoque} 
        />
        <Stack.Screen 
        name="AlertaVencimento" 
        component={AlertaVencimento} 
        />
        <Stack.Screen 
        name="Movimentacoes" 
        component={Movimentacoes} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
