import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button, Text, Surface, Avatar, Menu } from 'react-native-paper';
import { auth } from '../index';
import { getAuth, signOut } from 'firebase/auth';
import { useTranslation, initReactI18next } from 'react-i18next';
import i18next from 'i18next';

// Initialize i18n with English and Arabic translations
i18next
  .use(initReactI18next) // Passes i18n to react-i18next
  .init({
    resources: {
      en: {
        translation: {
          "Logged in as": "Logged in as",
          "Log out": "Log out",
          "Add Expense": "Add Expense",
          "View Dashboard": "View Dashboard",
        },
      },
      ar: {
        translation: {
          "Logged in as": "مسجل الدخول كـ",
          "Log out": "تسجيل الخروج",
          "Add Expense": "إضافة مصروف",
          "View Dashboard": "عرض لوحة التحكم",
        },
      },
    },
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language
    interpolation: {
      escapeValue: false, // React Native already prevents XSS
    },
  });

const Home = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();
  const { t, i18n } = useTranslation(); // Get the translation function
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false); // For language menu

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setEmail(user.email);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
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
      .catch(error => Alert.alert('Error', error.message));
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Menu
          visible={languageMenuVisible}
          onDismiss={() => setLanguageMenuVisible(false)}
          anchor={
            <Ionicons
              name="language-outline"
              size={24}
              color="#009E87"
              onPress={() => setLanguageMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={() => changeLanguage('en')} title="English" />
          <Menu.Item onPress={() => changeLanguage('ar')} title="العربية" />
        </Menu>
        <Button icon="logout" onPress={handleSignOut} style={styles.logoutButton}>
          {t("Log out")} 
        </Button>
      </Surface>
      <Surface style={styles.container}>
        <Avatar.Text size={80} label="U" style={styles.avatar} />
        <Text style={styles.userInfo}>{t("Logged in as")}:</Text>
        <Text style={styles.userInfo}>{email}</Text>
        <Button mode="contained" onPress={handleAddExpense} style={styles.button}>
          {t("Add Expense")}
        </Button>
        <Button mode="contained" onPress={handleViewDashboard} style={styles.button}>
          {t("View Dashboard")}
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
  logoutButton: {
    borderRadius: 25,
    backgroundColor: "#009E87",
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
    backgroundColor:'#009E87',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: '#009E87',
    marginBottom: 20,
  },
});

export default Home;
