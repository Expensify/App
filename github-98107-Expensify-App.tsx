// Assuming the button is in a screen component, e.g., ErrorScreen.tsx
// The issue is likely that the button lacks a proper onPress handler or uses incorrect navigation

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GoBackToHomeButton = () => {
  const navigation = useNavigation();

  const handleGoHome = () => {
    // Reset navigation to home screen (commonly 'Root' or 'Home')
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleGoHome}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>Go back to home page</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoBackToHomeButton;