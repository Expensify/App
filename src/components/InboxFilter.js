// src/components/InboxFilter.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InboxFilter = ({ filterText }) => {
  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterText}>{filterText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 5,
    minWidth: 'auto', // Adjusts width based on content
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
});

export default InboxFilter;
