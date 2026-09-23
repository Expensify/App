/**
 * Mileage receipt rendering component.
 *
 * This component is responsible for generating the receipt preview and the
 * enlarged view for mileage expenses. The original implementation was
 * incorrectly pulling the distance and total amount from the wrong
 * properties on the expense object, which caused the preview and enlarged
 * images to display mismatched values. The bug was that it used
 * `expense.distance` and `expense.totalAmount` instead of the canonical
 * `expense.distanceKm` and `expense.totalAmount` fields.
 *
 * The fix below normalises the data extraction and ensures that both the
 * preview and enlarged views use the same source of truth.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, StyleSheet } from 'react-native';
import { formatCurrency, formatDistance } from '../../utils/formatters';

/**
 * Extracts the relevant mileage data from an expense object.
 *
 * @param {Object} expense - The expense object from the API.
 * @returns {Object} An object containing the formatted distance and amount.
 */
const getMileageData = (expense) => {
  // The API returns distance in kilometers under `distanceKm`.
  // The total amount is stored under `totalAmount`.
  const distanceKm = typeof expense.distanceKm === 'number' ? expense.distanceKm : 0;
  const totalAmount = typeof expense.totalAmount === 'number' ? expense.totalAmount : 0;

  return {
    distance: formatDistance(distanceKm),
    amount: formatCurrency(totalAmount),
  };
};

/**
 * Renders the mileage receipt preview.
 *
 * @param {Object} props
 * @param {Object} props.expense - The expense object.
 * @param {boolean} props.isEnlarged - Flag to indicate if the view is enlarged.
 */
const MileageReceipt = ({ expense, isEnlarged }) => {
  const { distance, amount } = getMileageData(expense);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mileage Receipt</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Distance:</Text>
        <Text style={styles.value}>{distance}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Total:</Text>
        <Text style={styles.value}>{amount}</Text>
      </View>
      {isEnlarged && (
        <Image
          source={{ uri: expense.receiptImageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

MileageReceipt.propTypes = {
  expense: PropTypes.shape({
    distanceKm: PropTypes.number,
    totalAmount: PropTypes.number,
    receiptImageUrl: PropTypes.string,
  }).isRequired,
  isEnlarged: PropTypes.bool,
};

MileageReceipt.defaultProps = {
  isEnlarged: false,
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  image: {
    marginTop: 12,
    width: '100%',
    height: 200,
  },
});

export default MileageReceipt;
