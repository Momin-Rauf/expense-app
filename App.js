// In App.js in a new project

import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import Home from './screens/Home';
import Register from './screens/Register';
import Dashboard from './screens/Dashboard';
import Expense from './screens/Expense';
import { PaperProvider } from 'react-native-paper';
const Stack = createNativeStackNavigator();

function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen options={{headerShown: false}}  name="home" component={Home} />
        <Stack.Screen name="register" component={Register} />
        <Stack.Screen name="dashboard" component={Dashboard} />
        <Stack.Screen name="expense" component={Expense} />
      </Stack.Navigator>
    </NavigationContainer>
    </PaperProvider>
  );
}

export default App;