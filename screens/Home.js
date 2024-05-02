import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button, Text, Surface, Avatar } from 'react-native-paper';
import { auth } from '../index'; // Assuming auth and signOut are exported from index.js
import { getAuth ,signOut} from 'firebase/auth';

const Home = () => {
  
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error (e.g., show error message)
      }
    };
  
    fetchUserData();
  }, []);

  const handleAddExpense = () => {
    navigation.navigate('expense');
  };

  const handleViewDashboard = () => {
    navigation.navigate('dashboard');
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => navigation.replace('login'))
      .catch(error => alert(error.message));
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Ionicons name="language-outline" size={24} color="#009E87" onPress={() => console.log('Language changed')} />
        <Button icon="logout" onPress={handleSignOut} style={styles.logoutButton}>
          Log out
        </Button>
      </Surface>
      <Surface style={styles.content}>
        <Avatar.Text size={80} label="U" style={styles.avatar} />
        <Text style={styles.userInfo}>Logged in as:</Text>
        <Text style={styles.userInfo}>{email}</Text>
        <Button mode="contained" onPress={handleAddExpense} style={styles.button}>
          Add Expense
        </Button>
        <Button mode="contained" onPress={handleViewDashboard} style={styles.button}>
          View Dashboard
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009E87',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#106458',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#106458',
  },
  logoutButton: {
    borderRadius: 25,
    backgroundColor:"#009E87",
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  userInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: '#009E87',
    marginBottom: 20,
  },
});

export default Home;
