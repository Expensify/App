// @flow
import * as React from 'react';
import {Modal, View, Text, Image, TouchableOpacity} from 'react-native';
import {getMileageReceiptData} from '../../libs/mileageReceipt';
import type {Expense} from '../../models/Expense';

type Props = {
    /** The expense to render */
    expense: Expense,
    /** Controls modal visibility */
    visible: boolean,
    /** Callback when the modal is dismissed */
    onClose: () => void,
};

/**
 * ExpenseReceiptModal renders a receipt preview for any expense type.
 * For mileage expenses we now source distance & total amount from the
 * dedicated mileage receipt helper to avoid mismatched data between
 * preview and enlarged view.
 */
export default function ExpenseReceiptModal({expense, visible, onClose}: Props) {
    const isMileage = expense.category === 'Mileage';

    // Use the new helper for mileage data
    const mileageData = isMileage ? getMileageReceiptData(expense) : null;

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
                <View className="bg-white rounded-lg p-4 w-11/12 max-w-md">
                    <TouchableOpacity onPress={onClose} className="self-end">
                        <Text className="text-gray-600">✕</Text>
                    </TouchableOpacity>

                    {/* Receipt Image */}
                    <Image
                        source={{uri: expense.receiptUrl}}
                        className="w-full h-48 object-cover rounded"
                        resizeMode="contain"
                    />

                    {/* Mileage specific details */}
                    {isMileage && mileageData && (
                        <View className="mt-4">
                            <Text className="text-lg font-medium">
                                Mileage Receipt
                            </Text>
                            <View className="flex-row justify-between mt-2">
                                <Text className="text-gray-700">Distance:</Text>
                                <Text className="font-semibold">{mileageData.distance}</Text>
                            </View>
                            <View className="flex-row justify-between mt-1">
                                <Text className="text-gray-700">Rate:</Text>
                                <Text className="font-semibold">
                                    {mileageData.rate}
                                    {expense.currency?.toUpperCase() === 'METRIC' ? ' /km' : ' /mi'}
                                </Text>
                            </View>
                            <View className="flex-row justify-between mt-1">
                                <Text className="text-gray-700">Total:</Text>
                                <Text className="font-semibold">{mileageData.totalAmount}</Text>
                            </View>
                        </View>
                    )}

                    {/* Non‑mileage fallback */}
                    {!isMileage && (
                        <View className="mt-4">
                            <Text className="text-lg font-medium">
                                {expense.category} Receipt
                            </Text>
                            <Text className="mt-2">{expense.description}</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}
