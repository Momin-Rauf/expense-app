import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, FlatList, Alert } from 'react-native';
import { Card, Text, Title, Provider as PaperProvider, Button, Modal, Portal } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { PieChart } from 'react-native-chart-kit';
import { auth } from '../index'; // Assuming auth and signOut are exported from index.js
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
          "Total Expense": "Total Expense",
          "Fetch total expense": "Fetch total expense",
          "Fetch Financial Status": "Fetch Financial Status",
          "Fetch Bill Reminders": "Fetch Bill Reminders",
          "Categories": "Categories",
          "Bill Reminders": "Bill Reminders",
        },
      },
      ar: {
        translation: {
          "Total Expense": "إجمالي المصروف",
          "Fetch total expense": "احصل على إجمالي المصروف",
          "Fetch Financial Status": "احصل على الحالة المالية",
          "Fetch Bill Reminders": "احصل على تذكيرات الفواتير",
          "Categories": "الفئات",
          "Bill Reminders": "تذكيرات الفواتير",
        },
      },
    },
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language
    interpolation: {
      escapeValue: false, // React Native already prevents XSS
    },
  });

const Dashboard = () => {
  const db = SQLite.openDatabase('fire.db');
  const [categories, setCategories] = useState([]);
  const [bills, setBills] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [email, setEmail] = useState('');
  const { t, i18n } = useTranslation(); // Get the translation function

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
    fetchBills();
    // Add this line
  }, []);

  const renderBill = ({ item }) => (
    <Card style={styles.billCard}>
      <Card.Content>
        <Text>Date: {item.date}</Text>
        <Text>Amount: ${item.amount}</Text>
        <Text>Description: {item.category}</Text>
      </Card.Content>
    </Card>
  );
  
  const fetchBills = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Bills WHERE user_id = ?;',
        [email],
        (_, { rows }) => {
          setBills(rows._array);
        },
        (_, error) => console.error('Error fetching bills:', error)
      );
    });
  };
  
  const fetchCategories = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT Categories.*, 
        (SELECT SUM(amount) FROM Expenses 
          WHERE Expenses.category_id = Categories.id and Expenses.user_id = ?
         
        ) as totalExpense,
        (SELECT date FROM Expenses 
          WHERE Expenses.category_id = Categories.id 
          AND Expenses.user_id = ?
          ORDER BY date DESC LIMIT 1
        ) as lastExpenseDate
        FROM Categories;`,
        [email],
        (_, { rows }) => {
          const data = rows._array;
          setCategories(data);
          console.log(data);
        },
        (_, error) => console.error('Error fetching categories:', error)
      );
      
    });
  };

  const fetchTotalExpense = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT SUM(amount) as total FROM Expenses WHERE user_id = ?;`,
        [email],
        (_, { rows }) => {
          const { total } = rows._array[0];
          setTotalExpense(total || 0);
        },
        error => console.error('Error fetching total expense:', error)
      );
    });
  };

  const fetchExpensesByCategory = (categoryId) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Expenses WHERE category_id = ? AND user_id = ?;',
        [categoryId, email],
        (_, { rows }) => {
          setExpenses(rows._array);
        },
        error => console.error('Error fetching expenses:', error)
      );
    });
  };

  const onCategoryClick = (category) => {
    fetchExpensesByCategory(category.id);
    setSelectedCategory(category);
    setIsModalVisible(true);
  };

  const renderExpense = ({ item }) => {
    // Convert the date string to a JavaScript Date object
    const expenseDate = new Date(item.date);
    // Format the date as desired (e.g., "MMM DD, YYYY")
    const formattedDate = expenseDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  
    return (
      <Card style={styles.expenseCard}>
        <Card.Content>
          <Text>Date: {formattedDate}</Text>
          <Text>Amount: ${item.amount}</Text>
          <Text>Description: {item.description}</Text>
        </Card.Content>
      </Card>
    );
  };
  
  const renderCategory = (category) => (
    <Card key={category.id} style={styles.categoryCard} onPress={() => onCategoryClick(category)}>
      <Card.Content>
        <Title style={styles.categoryName}>{category.name}</Title>
        <Text>Total Expense: ${category.totalExpense}</Text>
        <Text>Last Expense Date: {category.lastExpenseDate}</Text>
      </Card.Content>
    </Card>
  );

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>{email}</Title>
        <Title style={styles.title}>{t("Total Expense")}</Title>
        
        <PieChart
          data={categories.map(category => ({
            name: category.name,
            expense: category.totalExpense,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
          }))}
          width={300}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="expense"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
        
        <Button
          style={[styles.button, { color: 'white' }]}
          onPress={fetchTotalExpense}
          labelStyle={{ color: 'white' }}
        >
          {t("Fetch total expense")}
        </Button>
        <Button
          style={[styles.button, { color: 'white' }]}
          onPress={fetchCategories}
          labelStyle={{ color: 'white' }}
        >
          {t("Fetch Financial Status")}
        </Button>
        <Button
          style={[styles.button, { color: 'white' }]}
          onPress={fetchBills}
          labelStyle={{ color: 'white' }}
        >
          {t("Fetch Bill Reminders")}
        </Button>

        <Title style={styles.title}>{t("Categories")}</Title>
        <Text style={styles.totalExpenseText}>{t("Total Expense")}: ${totalExpense}</Text>
        {categories.map(category => renderCategory(category))}
      </ScrollView>
      <Title style={styles.title}>{t("Bill Reminders")}</Title>
      <FlatList
        data={bills}
        keyExtractor={item => item.id.toString()}
        renderItem={renderBill}
      />
      <Portal>
        <Modal visible={isModalVisible} onDismiss={() => setIsModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Title>{t("Expenses in")} {selectedCategory?.name}</Title>
          <FlatList
            data={expenses}
            keyExtractor={item => item.id.toString()}
            renderItem={renderExpense}
          />
        </Modal>
      </Portal>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: 'blue',
    color: 'white',
  },
  totalExpenseText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryCard: {
    width: '100%',
    marginBottom: 20,
  },
  categoryName: {
    marginBottom: 5,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  expenseCard: {
    marginBottom: 10,
  },
  billCard: {
    marginBottom: 10,
  },
});

export default Dashboard;
