import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { auth } from '../index';

const db = SQLite.openDatabase('expenseTracker.db');

const Expense = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [dueDateBill, setDueDateBill] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check if tables are created
    createTables();

    // Fetch categories
    fetchCategories();

    // Fetch current user's email and password
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
  }, []);

  // Function to create tables if not exists
  const createTables = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL)'
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, amount REAL NOT NULL, description TEXT, added_month TEXT NOT NULL, category_id INTEGER NOT NULL, user_id INTEGER NOT NULL, FOREIGN KEY (category_id) REFERENCES categories(id), FOREIGN KEY (user_id) REFERENCES users(id))'
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS bills (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL, deadline TEXT NOT NULL, amount REAL NOT NULL, user_id INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id))'
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)'
      );
    });
  };

  // Function to fetch categories
  const fetchCategories = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM categories;`,
        [],
        (_, { rows }) => {
          const data = rows._array;
          setCategories(data);
          if (data.length > 0) {
            setSelectedCategory(data[0].id.toString());
          }
        },
        error => {
          console.error('Error fetching categories:', error);
        }
      );
    });
  };

  // Function to add a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO categories (name) VALUES (?);`,
        [newCategoryName.trim()],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            Alert.alert('Success', 'Category added successfully');
            fetchCategories();
            setNewCategoryName('');
          } else {
            Alert.alert('Error', 'Failed to add category');
          }
        },
        error => {
          console.error('Error adding category:', error);
          Alert.alert('Error', 'Failed to add category');
        }
      );
    });
  };

  // Function to add a new expense
  const handleAddExpense = () => {
    if (!newExpenseAmount.trim() || !selectedCategory.trim() || !newExpenseDescription.trim()) {
      Alert.alert('Error', 'Please enter all expense details');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO expenses (email, category_id, amount, date, description) VALUES (?, ?, ?, ?, ?);`,
        [email, parseInt(selectedCategory), parseFloat(newExpenseAmount), dueDate.toISOString(), newExpenseDescription.trim()],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            Alert.alert('Success', 'Expense added successfully');
            setNewExpenseAmount('');
            setNewExpenseDescription('');
          } else {
            Alert.alert('Error', 'Failed to add expense');
          }
        },
        error => {
          console.error('Error adding expense:', error);
          Alert.alert('Error', 'Failed to add expense');
        }
      );
    });
  };

  // Function to add a new bill
  const handleAddBill = () => {
    if (!newBillName.trim() || !newBillAmount.trim()) {
      Alert.alert('Error', 'Please enter both bill name and amount');
      return;
    }

    // Validate bill amount to be a positive number
    const amount = parseFloat(newBillAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid bill amount');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO bills (user_id, amount, deadline, name) VALUES (?, ?, ?, ?);`,
        [email, amount, dueDateBill.toISOString(), newBillName.trim()],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            Alert.alert('Success', 'Bill added successfully');
            setNewBillAmount('');
            setNewBillName('');
          } else {
            Alert.alert('Error', 'Failed to add bill');
          }
        },
        (tx, error) => {
          console.error('Error adding bill:', error);
          Alert.alert('Error', 'Failed to add bill');
        }
      );
    });
  };

  // Function to display date picker
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  // Function to hide date picker
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Function to handle date confirmation
  const handleConfirm = date => {
    setDueDate(date);
    hideDatePicker();
  };

  // Function to handle bill date confirmation
  const handleConfirmBill = date => {
    setDueDateBill(date);
    hideDatePicker();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Expense Tracker</Text>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Add Expense</Text>
        <View style={styles.inputContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue, itemIndex) => setSelectedCategory(itemValue)}
            style={styles.picker}
          >
            {categories.map(category => (
              <Picker.Item key={category.id} label={category.name} value={category.id.toString()} />
            ))}
          </Picker>
        </View>
        <TextInput
          placeholder="Enter expense amount"
          value={newExpenseAmount}
          onChangeText={setNewExpenseAmount}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Enter expense description"
          value={newExpenseDescription}
          onChangeText={setNewExpenseDescription}
          style={styles.input}
        />
        <TouchableOpacity onPress={showDatePicker} style={[styles.button, styles.greenButton]}>
          <Text style={styles.buttonText}>Select Date</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
        <TouchableOpacity onPress={handleAddExpense} style={[styles.button, styles.greenButton]}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Add Category</Text>
        <TextInput
          placeholder="Enter category name"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleAddCategory} style={[styles.button, styles.greenButton]}>
          <Text style={styles.buttonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Add Bill</Text>
        <TextInput
          placeholder="Enter bill name"
          value={newBillName}
          onChangeText={text => setNewBillName(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Enter bill amount"
          value={newBillAmount}
          onChangeText={text => setNewBillAmount(text)}
          style={styles.input}
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={handleAddBill} style={[styles.button, styles.greenButton]}>
          <Text style={styles.buttonText}>Add Bill</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#006400',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#006400',
  },
  form: {
    width: '80%',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#006400',
    marginBottom: 10,
    borderRadius: 5,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: '#006400',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#006400',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  greenButton: {
    backgroundColor: '#32CD32',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Expense;
