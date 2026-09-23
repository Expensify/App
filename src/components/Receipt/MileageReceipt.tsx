import React from 'react';
import {View, Text, Image, Pressable} from 'react-native';
import {formatCurrency, formatDistance} from '../../utils/format';
import type {Expense} from '../../types/expense';

type Props = {
    /** The expense object containing mileage data */
    expense: Expense;
    /** Optional callback when the receipt image is pressed (e.g., to open a modal) */
    onPressImage?: () => void;
};

/**
 * Renders a receipt for a mileage expense.
 *
 * The component is deliberately simple and uses only the fields that are
 * guaranteed to be present on a mileage expense:
 *   - `mileageDistance` – the distance travelled.
 *   - `amount` – the total amount (in cents) that the expense is worth.
 *
 * By pulling the values directly from the `expense` prop we avoid the
 * previous bug where the preview and enlarged view displayed stale or
 * mismatched data.
 */
export const MileageReceipt: React.FC<Props> = ({expense, onPressImage}) => {
    const {
        mileageDistance,
        amount,
        currency = 'USD',
        receipt?.url: receiptUrl,
        receipt?.thumbnailUrl: thumbnailUrl,
    } = expense;

    // Defensive defaults – if any required field is missing we render a placeholder.
    const distanceDisplay = mileageDistance != null ? formatDistance(mileageDistance) : '—';
    const amountDisplay = amount != null ? formatCurrency(amount, currency) : '—';

    return (
        <View className="p-4 bg-white rounded-lg shadow">
            {/* Header */}
            <Text className="text-lg font-semibold mb-2">Mileage Receipt</Text>

            {/* Receipt Image */}
            {thumbnailUrl ? (
                <Pressable onPress={onPressImage} testID="receipt-image-pressable">
                    <Image
                        source={{uri: thumbnailUrl}}
                        className="w-full h-48 object-cover rounded mb-4"
                        resizeMode="cover"
                        accessibilityLabel="Mileage receipt preview"
                    />
                </Pressable>
            ) : (
                <View className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center">
                    <Text className="text-gray-500">No receipt image</Text>
                </View>
            )}

            {/* Details */}
            <View className="flex flex-col space-y-1">
                <View className="flex flex-row justify-between">
                    <Text className="text-gray-600">Distance</Text>
                    <Text testID="distance-value" className="font-medium">{distanceDisplay}</Text>
                </View>
                <View className="flex flex-row justify-between">
                    <Text className="text-gray-600">Total Amount</Text>
                    <Text testID="amount-value" className="font-medium">{amountDisplay}</Text>
                </View>
            </View>
        </View>
    );
};
