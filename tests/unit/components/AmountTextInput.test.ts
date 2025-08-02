import {formatCurrencyInput} from '../../../src/components/AmountTextInput';

test('formatCurrencyInput formats correctly', () => {
    expect(formatCurrencyInput('100')).toBe('$100');
    expect(formatCurrencyInput('200.50')).toBe('$200.50');
    expect(formatCurrencyInput('')).toBe('$');
});
