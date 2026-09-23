import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {MileageReceipt} from '../MileageReceipt';
import type {Expense}} from '../../../types/expense';

describe('MileageReceipt', () => {
    const mockExpense: Expense = {
        id: '123',
        category: 'Mileage',
        amount: 1575, // $15.75
        currency: 'USD',
        mileageDistance: 42.3,
        receipt: {
            url: 'https://example.com/receipt-full.jpg',
            thumbnailUrl: 'https://example.com/receipt-thumb.jpg',
        },
    };

    it('renders distance and amount correctly', () => {
        const {getByTestId} = render(<MileageReceipt expense={mockExpense} />);

        expect(getByTestId('distance-value').props.children).toBe('42.3 mi');
        expect(getByTestId('amount-value').props.children).toBe('$15.75');
    });

    it('calls onPressImage when the receipt image is tapped', () => {
        const onPressImage = jest.fn();
        const {getByTestId} = render(
            <MileageReceipt expense={mockExpense} onPressImage={onPressImage} />
        );

        fireEvent.press(getByTestId('receipt-image-pressable'));
        expect(onPressImage).toHaveBeenCalledTimes(1);
    });

    it('shows placeholders when data is missing', () => {
        const incompleteExpense: Expense = {
            id: '456',
            category: 'Mileage',
            amount: 0,
            mileageDistance: undefined,
        };

        const {queryByTestId, getByText} = render(<MileageReceipt expense={incompleteExpense} />);

        // No image placeholder
        expect(queryByTestId('receipt-image-pressable')).toBeNull();
        expect(getByText('No receipt image')).toBeTruthy();

        // Distance placeholder
        expect(getByTestId('distance-value').props.children).toBe('—');

        // Amount placeholder (0 cents should still format to $0.00)
        expect(getByTestId('amount-value').props.children).toBe('$0.00');
    });
});
