import { StyleSheet,Image, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import the icon library
import React from 'react';


const SplashScreen = () => {
  return (
    <View style={styles.container}>
       <Image source={require('../assets/cash.png')} />
      <Text style={styles.title}>Expense Tracker</Text> 
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#009387', // Background color
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white', // Text color
      marginTop: 10, // Space between icon and text
    },
  });