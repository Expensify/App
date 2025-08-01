import {calculateWalletBalance} from '../../../src/components/CurrentWalletBalance';

test('calculateWalletBalance calculates correctly', () => {
    expect(calculateWalletBalance(150)).toBe('Total balance is $150.00');
    expect(calculateWalletBalance(99.99)).toBe('Total balance is $99.99');
    expect(calculateWalletBalance(0)).toBe('Total balance is $0.00');
});
