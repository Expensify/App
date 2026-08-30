// Assuming this is in the ReportScreen or Report Expenses List component
// File path likely: src/apps/main/ios/Exponent/Exponent/Exponent/App/ReportScreen.tsx or similar

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';

interface Expense {
  id: string;
  amount: number;
  description: string;
  isExisting: boolean; // Flag indicating if expense was previously saved
}

interface ReportScreenProps {
  route: any;
  navigation: any;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ route, navigation }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reportId, setReportId] = useState<string>(route.params?.reportId || '');

  useEffect(() => {
    // Load expenses when report opens
    loadExpenses();
  }, [reportId]);

  const loadExpenses = async () => {
    // Simulate loading expenses from API/local storage
    // In real code, this would fetch from backend or local DB
    const loadedExpenses: Expense[] = await fetchExpensesForReport(reportId);
    setExpenses(loadedExpenses);
  };

  const fetchExpensesForReport = async (reportId: string): Promise<Expense[]> => {
    // Placeholder for actual API call
    // This would retrieve expenses associated with the report
    return [
      { id: '1', amount: 50, description: 'Coffee', isExisting: true },
      { id: '2', amount: 120, description: 'Office supplies', isExisting: false },
      { id: '3', amount: 30, description: 'Lunch', isExisting: true },
    ];
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={[styles.expenseItem, item.isExisting && styles.existingExpenseHighlight]}>
      <View style={styles.expenseInfo}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  expenseItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  existingExpenseHighlight: {
    backgroundColor: '#e8f5e9', // Light green background for existing expenses
    borderWidth: 2,
    borderColor: '#4caf50', // Green border
  },
  expenseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ReportScreen;