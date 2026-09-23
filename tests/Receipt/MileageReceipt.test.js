import React from 'react';
import { render } from '@testing-library/react-native';
import MileageReceipt from '../../src/components/Receipt/MileageReceipt';

describe('MileageReceipt', () => {
  const expense = {
    distanceKm: 120,
    totalAmount: 240,
    receiptImageUrl: 'https://example.com/receipt.png',
  };

  it('renders correct distance and amount in preview', () => {
    const { getByText } = render(<MileageReceipt expense={expense} />);
    expect(getByText('Distance:')).toBeTruthy();
    expect(getByText('74.5 mi')).toBeTruthy(); // 120 km ≈ 74.5 miles
    expect(getByText('Total:')).toBeTruthy();
    expect(getByText('$240.00')).toBeTruthy();
  });

  it('renders image when enlarged', () => {
    const { getByTestId } = render(
      <MileageReceipt expense={expense} isEnlarged={true} />
    );
    const image = getByTestId('receipt-image');
    expect(image.props.source.uri).toBe(expense.receiptImageUrl);
  });
});
