/**
 * ReceiptEnlargedView component
 *
 * This component displays a full‑size view of a mileage receipt.
 * It reuses the same mileage information extraction logic as the
 * preview to guarantee consistency.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {View, Text, Image, StyleSheet, ScrollView} from 'react-native';
import {getReceiptImageUrl} from '../../utils/receiptUtils';

/**
 * Reuse the helper from ReceiptPreview to keep mileage data in sync.
 */
import {getMileageInfo} from './ReceiptPreview';

const ReceiptEnlargedView = ({expense}) => {
  const {distance, amount} = getMileageInfo(expense);
  const imageUrl = getReceiptImageUrl(expense.id, /*isLarge=*/true);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{uri: imageUrl}} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.distanceText}>{distance}</Text>
        <Text style={styles.amountText}>{amount}</Text>
      </View>
    </ScrollView>
  );
};

ReceiptEnlargedView.propTypes = {
  /** The expense object to display. */
  expense: PropTypes.shape({
    id: PropTypes.string.isRequired,
    mileageDistance: PropTypes.number.isRequired,
    mileageAmount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  infoContainer: {
    width: '100%',
  },
  distanceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  amountText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ReceiptEnlargedView;
