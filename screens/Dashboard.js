import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';
import {
    LineChart,
    
  } from "react-native-chart-kit";
const db = SQLite.openDatabase('expenseTracker.db');

const line = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
      strokeWidth: 2, // optional
    },
  ],
};

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalPendingBills, setTotalPendingBills] = useState(0);
  const [pendingBills, setPendingBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  useEffect(() => {
    fetchUserData();
    fetchTotalExpense();
    fetchTotalPendingBills();
    fetchPendingBills();
    fetchExpenses();
  }, []);

  const fetchUserData = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT email FROM users WHERE id = ?;`,
        [1], // Assuming user id is 1
        (_, { rows }) => {
          if (rows.length > 0) {
            setUserName(rows.item(0).name);
          } else {
            console.error('User data not found.');
          }
        },
        (_, error) => {
          console.error('Error fetching user data:', error);
        }
      );
    });
  };
  

  const fetchTotalExpense = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT SUM(amount) AS total FROM Expenses WHERE user_id = ?;`,
        [1], // Assuming user id is 1
        (_, { rows }) => {
          setTotalExpense(rows.item(0).total || 0);
        },
        error => {
          console.error('Error fetching total expense:', error);
        }
      );
    });
  };

  const fetchTotalPendingBills = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) AS total FROM Bills WHERE user_id = ?;`,
        [1], // Assuming user id is 1
        (_, { rows }) => {
          setTotalPendingBills(rows.item(0).total || 0);
        },
        error => {
          console.error('Error fetching total pending bills:', error);
        }
      );
    });
  };

  const fetchPendingBills = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM Bills WHERE user_id = ?;`,
        [1], // Assuming user id is 1
        (_, { rows }) => {
          setPendingBills(rows._array || []);
        },
        error => {
          console.error('Error fetching pending bills:', error);
        }
      );
    });
  };

  const fetchExpenses = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT e.*, c.name AS category_name FROM Expenses e JOIN Categories c ON e.category_id = c.id WHERE e.user_id = ?;`,
        [1], // Assuming user id is 1
        (_, { rows }) => {
          setExpenses(rows._array || []);
        },
        error => {
          console.error('Error fetching expenses:', error);
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      
      <View>
  <Text>
    Bezier Line Chart
  </Text>
  <LineChart
    data={line}
    width={500} // from react-native
    height={220}
    yAxisLabel={'$'}
    chartConfig={{
      backgroundColor: '#e26a00',
      backgroundGradientFrom: '#fb8c00',
      backgroundGradientTo: '#ffa726',
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
  />
</View>
      <Text style={styles.userName}>{userName}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Expense</Text>
        <Text style={styles.cardContent}>${totalExpense.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Pending Bills</Text>
        <Text style={styles.cardContent}>{totalPendingBills}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pending Bills</Text>
        <FlatList
          data={pendingBills}
          renderItem={({ item }) => (
            <Text style={styles.billItem}>
              {item.name} - ${item.amount.toFixed(2)} (Due Date: {item.date})
            </Text>
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Expenses</Text>
        <FlatList
          data={expenses}
          renderItem={({ item }) => (
            <Text style={styles.expenseItem}>
              {item.description} - ${item.amount.toFixed(2)} ({item.category_name})
            </Text>
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f0f0f0', // Background color changed to light gray
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardContent: {
    fontSize: 16,
  },
  billItem: {
    fontSize: 14,
    marginBottom: 5,
  },
  expenseItem: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default Dashboard;