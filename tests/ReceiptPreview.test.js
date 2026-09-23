/**
 * @jest-environment jsdom
 */

import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import ReceiptPreview from '../src/components/Receipt/ReceiptPreview';
import ReceiptEnlargedView from '../src/components/Receipt/ReceiptEnlargedView';

const mockExpense = {
  id: '12345',
  mileageDistance: 120,
  mileageAmount: 150.75,
  currency: 'USD',
};

describe('Receipt components', () => {
  it('renders correct mileage distance and amount in preview', () => {
    const {getByText} = render(
      <ReceiptPreview expense={mockExpense} onPress={() => {}} />,
    );
    expect(getByText('120 mi')).toBeTruthy();
    expect(getByText('150.75 USD')).toBeTruthy();
  });

  it('renders correct mileage distance and amount in enlarged view', () => {
    const {getByText} = render(<ReceiptEnlargedView expense={mockExpense} />);
    expect(getByText('120 mi')).toBeTruthy();
    expect(getByText('150.75 USD')).toBeTruthy();
  });

  it('calls onPress when preview is tapped', () => {
    const onPressMock = jest.fn();
    const {getByTestId} = render(
      <ReceiptPreview expense={mockExpense} onPress={onPressMock} />,
    );
    const touchable = getByTestId('receipt-preview-touchable');
    fireEvent.press(touchable);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
