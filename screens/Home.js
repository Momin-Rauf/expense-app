import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../index';
import * as SQLite from 'expo-sqlite';
import { getAuth, signOut } from 'firebase/auth';

const Home = () => {
  
  const [db, setDb] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setEmail(user.email);
          setPassword(user.password);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => console.log('Language changed')} style={styles.languageButton}>
          <Ionicons name="language-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut} style={[styles.button, styles.logout]}>
          <Text style={styles.buttonText}>Log out</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={[styles.button,styles.viewDashboardButton ]} >{email}</Text>
        <TouchableOpacity onPress={handleAddExpense} style={[styles.button, styles.addExpenseButton]}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleViewDashboard} style={[styles.button, styles.viewDashboardButton]}>
          <Text style={styles.buttonText}>View Dashboard</Text>
        </TouchableOpacity>
      </View>
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
  },
  languageButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  logout: {
    width: '25%',
    height: 40,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  addExpenseButton: {
    backgroundColor: '#fff',
  },
  viewDashboardButton: {
    backgroundColor: '#fff',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#009E87',
  },
});

export default Home;
