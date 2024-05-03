import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signInWithEmailAndPassword} from "firebase/auth";
import React, { useState,useEffect } from 'react';
import { auth } from "../index";
const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(()=>{
   const unsubscribe =auth.onAuthStateChanged((user)=>{
    if (user){
        navigation.navigate("home");
    }
   });
  },[]);

  const signIn = () => {
    signInWithEmailAndPassword(auth,email,password)
    .then(userCredentials => {
        const user = userCredentials.user;
        console.log(user.email);
    } )
    .catch(error=>alert(error.message))
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.textHeader}>Welcome Back!</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.textFooter}>Email</Text>
        <View style={styles.action}>
          <TextInput
            placeholder="Your Email"
            style={styles.textInput}
            autoCapitalize="none"
            onChangeText={(text) => setEmail(text)}
          />
        </View>
        <Text style={[styles.textFooter, { marginTop: 35 }]}>Password</Text>
        <View style={styles.action}>
          <TextInput
            placeholder="Your Password"
            secureTextEntry={true}
            style={styles.textInput}
            autoCapitalize="none"
            onChangeText={(text) => setPassword(text)}
          />
        </View>
        <TouchableOpacity style={styles.signIn} onPress={signIn}>
          <Text  style={[styles.textSign, { color: 'white' }]}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('register')} >
          <Text style={{ color: '#009387', marginTop: 15 }}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#009387',
    },
    header: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingBottom: 50,
    },
    footer: {
      flex: 3,
      backgroundColor: 'white',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 20,
      paddingVertical: 30,
    },
    textHeader: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 30,
    },
    textFooter: {
      color: '#05375a',
      fontSize: 18,
    },
    action: {
      flexDirection: 'row',
      marginTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
      paddingBottom: 5,
    },
    textInput: {
      flex: 1,
      paddingLeft: 10,
      color: '#05375a',
    },
    signIn: {
      width: '100%',
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: '#009387',
      marginTop: 15,
    },
    textSign: {
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
  
  