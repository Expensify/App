// Assuming this is in a React Native component file like ExpenseDetailsView.tsx or similar
// The exact file path may vary, but this shows the core logic changes needed

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Expense {
  type: string;
  card?: {
    feedName: string;
    lastFour: string;
  };
  // other expense properties...
}

interface ExpenseDetailsViewProps {
  expense: Expense;
}

const ExpenseDetailsView: React.FC<ExpenseDetailsViewProps> = ({ expense }) => {
  return (
    <View style={styles.container}>
      {/* Show expense type */}
      <View style={styles.row}>
        <Text style={styles.label}>Expense Type:</Text>
        <Text style={styles.value}>{expense.type}</Text>
      </View>
      
      {/* Show card info with feed name - lastFour format for commercial cards */}
      {expense.card && (
        <View style={styles.row}>
          <Text style={styles.label}>Card:</Text>
          <Text style={styles.value}>
            {expense.card.feedName} - {expense.card.lastFour}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  value: {
    flex: 1,
  },
});

export default ExpenseDetailsView;