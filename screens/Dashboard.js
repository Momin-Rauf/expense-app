import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, FlatList } from 'react-native';
import { Card, Text, Title, Provider as PaperProvider, Button, Modal, Portal } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { PieChart } from 'react-native-chart-kit';


const Dashboard = () => {
  const db = SQLite.openDatabase('tracker.db');
  const [categories, setCategories] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);


  useEffect(() => {
    fetchCategories();
    fetchTotalExpense();
    fetchPieChartData(); // Add this line
  }, []);
  
  const fetchPieChartData = () => {
    // Fetch data for the pie chart, for example:
    const data = [
      { name: 'Category 1', amount: 200 },
      { name: 'Category 2', amount: 300 },
      { name: 'Category 3', amount: 400 },
    ];
    setPieChartData(data);
  };
  
  const fetchCategories = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT Categories.*, 
        (SELECT SUM(amount) FROM Expenses WHERE Expenses.category_id = Categories.id) as totalExpense,
        (SELECT date FROM Expenses WHERE Expenses.category_id = Categories.id ORDER BY date DESC LIMIT 1) as lastExpenseDate
        FROM Categories;`,
        [],
        (_, { rows }) => {
          const data = rows._array;
          setCategories(data);
        },
        error => console.error('Error fetching categories:', error)
      );
    });
  };

  const fetchTotalExpense = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT SUM(amount) as total FROM Expenses;',
        [],
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
        'SELECT * FROM Expenses WHERE category_id = ?;',
        [categoryId],
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

  const renderExpense = ({ item }) => (
    <Card style={styles.expenseCard}>
      <Card.Content>
        <Text>Date: {item.date}</Text>
        <Text>Amount: ${item.amount}</Text>
        <Text>Description: {item.description}</Text>
      </Card.Content>
    </Card>
  );

  const renderCategory = (category) => (
    <Card key={category.id} style={styles.categoryCard} onPress={() => onCategoryClick(category)}>
      <Card.Content>
        <Title style={styles.categoryName}>{category.name}</Title>
        <Text>Total Expense: ${category.totalExpense}</Text>
        <Text>Last Expense Date: {category.lastExpenseDate}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
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

        <Title style={styles.title}>Categories</Title>
        <Text style={styles.totalExpenseText}>Total Expense: ${totalExpense}</Text>
        {categories.map(category => renderCategory(category))}
      </ScrollView>
      <Portal>
        <Modal visible={isModalVisible} onDismiss={() => setIsModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Title>Expenses in {selectedCategory?.name}</Title>
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
});

export default Dashboard;
