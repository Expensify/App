// src/components/AMEXCardAssignment.js
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import axios from 'axios';

const AMEXCardAssignment = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAssignCard = async () => {
    try {
      if (!isAuthenticated) {
        // Attempt to authenticate with AMEX
        await axios.post('https://api.amex.com/auth', { username: 'user', password: 'pass' });
        setIsAuthenticated(true);
      }

      // Assign the card after successful authentication
      await axios.post('https://api.expensify.com/assignCard');
      alert('Card assigned successfully!');
    } catch (error) {
      console.error('Error assigning card:', error);
      alert('Failed to assign card. Please try again later.');
    }
  };

  return (
    <View>
      <Text>Assign a new AMEX card</Text>
      <Button title='Assign Card' onPress={handleAssignCard} disabled={!isAuthenticated} />
    </View>
  );
};

export default AMEXCardAssignment;