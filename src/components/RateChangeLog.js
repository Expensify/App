import React from 'react';
import { Text } from 'react-native';

const RateChangeLog = ({ oldRate, newRate }) => {
  const currencySymbol = getCurrencySymbol(oldRate.currency);
  return (
    <Text>
      Changed the rate of the distance rate "{oldRate.name}" to {currencySymbol}{newRate.amount} (previously {currencySymbol}{oldRate.amount})
    </Text>
  );
};

const getCurrencySymbol = (currencyCode) => {
  switch (currencyCode) {
    case 'ARS':
      return '$';
    default:
      return currencyCode;
  }
};

export default RateChangeLog;