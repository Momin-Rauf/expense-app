// In App.js in a new project

import * as React from 'react';
import { LogBox } from 'react-native';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import Home from './screens/Home';
import Register from './screens/Register';
import Dashboard from './screens/Dashboard';
import Expense from './screens/Expense';
import SplashScreen from './screens/SplashScreen';
import { PaperProvider } from 'react-native-paper';
const Stack = createNativeStackNavigator();

function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  LogBox.ignoreAllLogs();
  React.useEffect(() => {
    async function prepare() {
      try {
        // Your app initialization logic here
        
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Please remove this if you copy and paste the code!
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    // Show splash screen until the app is ready
    return <SplashScreen />;
  }

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