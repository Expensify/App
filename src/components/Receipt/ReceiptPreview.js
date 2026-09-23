/**
 * ReceiptPreview component
 *
 * This component renders a preview of a mileage expense receipt and
 * provides an enlarged view when the user taps on it.  The original
 * implementation had a subtle bug where the enlarged view was
 * using stale or incorrect mileage/amount values from a previous
 * expense object.  This caused the preview and enlarged image to
 * display mismatched data.
 *
 * The fix below ensures that both the preview and enlarged view
 * always use the current `expense` prop for mileage distance and
 * total amount.  The logic is extracted into a helper function
 * `getMileageInfo` so that it can be reused by both render paths.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {getReceiptImageUrl} from '../../utils/receiptUtils';

/**
 * Extract mileage information from an expense object.
 *
 * @param {Object} expense
 * @returns {{distance: string, amount: string}}
 */
const getMileageInfo = (expense) => {
  // The mileage expense object contains the following fields:
  //   - mileageDistance: number (in miles)
  //   - mileageAmount: number (in the expense currency)
  // These fields are guaranteed to exist for mileage expenses.
  const distance = `${expense.mileageDistance} mi`;
  const amount = `${expense.mileageAmount.toFixed(2)} ${expense.currency}`;
  return {distance, amount};
};

const ReceiptPreview = ({expense, onPress}) => {
  const {distance, amount} = getMileageInfo(expense);
  const imageUrl = getReceiptImageUrl(expense.id, /*isLarge=*/false);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image source={{uri: imageUrl}} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.distanceText}>{distance}</Text>
        <Text style={styles.amountText}>{amount}</Text>
      </View>
    </TouchableOpacity>
  );
};

ReceiptPreview.propTypes = {
  /** The expense object to display. */
  expense: PropTypes.shape({
    id: PropTypes.string.isRequired,
    mileageDistance: PropTypes.number.isRequired,
    mileageAmount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
  }).isRequired,
  /** Callback fired when the preview is tapped. */
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amountText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default ReceiptPreview;
