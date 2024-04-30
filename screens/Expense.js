import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';

import * as SQLite from 'expo-sqlite';
import { auth } from '../index';

const db = SQLite.openDatabase('expense.db');

const Expense = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Fetch current user's information
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email); // Using a placeholder email for demonstration
    }

    // Open or create the SQLite database
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        );`,
        [],
        () => console.log('Category table created successfully'),
        (_, error) => console.error('Error creating category table:', error)
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Bills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          amount REAL NOT NULL,
          date TEXT NOT NULL,
          category TEXT NOT NULL
        );`,
        [],
        () => console.log('Bill table created successfully'),
        (_, error) => console.error('Error creating bill table:', error)
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER NOT NULL,
          user_id TEXT NOT NULL,
          amount REAL NOT NULL,
          date TEXT NOT NULL,
          description TEXT,
          FOREIGN KEY (category_id) REFERENCES Categories(id)
        );`,
        [],
        () => console.log('Expense table created successfully'),
        (_, error) => console.error('Error creating expense table:', error)
      );
    });

    fetchCategories(); // Fetch categories on component mount
  }, []);

  const fetchCategories = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM Categories;`,
        [],
        (_, { rows }) => {
          const data = rows._array;
          setCategories(data);
          if (data.length > 0) {
            setSelectedCategory(data[0].id.toString()); // Set the first category as selected by default
          }
        },
        error => {
          console.error('Error fetching categories:', error);
        }
      );
    });
  };

  const handleAddCategory = () => {
    // Validation for category name
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter category name');
      return;
    }

    // Check if the category name already exists
    if (categories.some(category => category.name === newCategoryName.trim())) {
      Alert.alert('Error', 'Category name already exists');
      return;
    }

    // Insert the new category into the database
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Categories (name) VALUES (?);`,
        [newCategoryName.trim()],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            Alert.alert('Success', 'Category added successfully');
            fetchCategories(); // Re-fetch categories after adding a new one
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

  const handleAddBill = () => {
    // Validation for bill name
    if (!newBillName.trim()) {
      Alert.alert('Error', 'Please enter bill name');
      return;
    }

    // Validation for bill amount
    if (!newBillAmount.trim() || isNaN(parseFloat(newBillAmount))) {
      Alert.alert('Error', 'Please enter valid bill amount');
      return;
    }

    // Insert the new bill into the database
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Bills (user_id, amount, date, category) VALUES (?, ?, ?, ?);`,
        [email, parseFloat(newBillAmount), expenseDate.toISOString(), newBillName.trim()],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            Alert.alert('Success', 'Bill added successfully');
            setNewBillAmount('');
            setNewBillName('');
          } else {
            Alert.alert('Error', 'Failed to add bill');
          }
        },
        error => {
          console.error('Error adding bill:', error);
          Alert.alert('Error', 'Failed to add bill');
        }
      );
    });
  };

  const handleAddExpense = () => {
    // Validation for expense category
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    // Validation for expense amount
    if (!newBillAmount.trim() || isNaN(parseFloat(newBillAmount))) {
      Alert.alert('Error', 'Please enter valid expense amount');
      return;
    }

    // Insert the new expense into the database
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Expenses (category_id, user_id, amount, date, description) VALUES (?, ?, ?, ?, ?);`,
        [selectedCategory, email, parseFloat(newBillAmount), expenseDate.toISOString(), expenseDescription.trim()],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            Alert.alert('Success', 'Expense added successfully');
            setNewCategoryName('');
            setNewBillAmount('');
            setExpenseDescription('');
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

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = date => {
    setExpenseDate(date);
    hideDatePicker();
  };

  return (
    <View style={styles.container}>
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
          onChangeText={setNewBillName}
          style={styles.input}
        />
        <TextInput
          placeholder="Enter bill amount"
          value={newBillAmount}
          onChangeText={setNewBillAmount}
          style={styles.input}
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={handleAddBill} style={[styles.button, styles.greenButton]}>
          <Text style={styles.buttonText}>Add Bill</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Add Expense</Text>
        <Picker
          selectedValue={selectedCategory}
          style={styles.input}
          onValueChange={(itemValue, itemIndex) => setSelectedCategory(itemValue)}
        >
          <Picker.Item label="Select Category" value="" />
          {categories.map(category => (
            <Picker.Item key={category.id} label={category.name} value={category.id.toString()} />
          ))}
        </Picker>
        <TextInput
          placeholder="Enter expense amount"
          value={newBillAmount}
          onChangeText={setNewBillAmount}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Enter expense description"
          value={expenseDescription}
          onChangeText={setExpenseDescription}
          style={styles.input}
        />
        <TouchableOpacity onPress={showDatePicker} style={[styles.button, styles.greenButton]}>
          <Text style={styles.buttonText}>Select Expense Date</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#006400',
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
