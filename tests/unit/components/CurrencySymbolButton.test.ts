import {displayCurrencySymbol} from '../../../src/components/CurrencySymbolButton';

test('displayCurrencySymbol displays correctly', () => {
    expect(displayCurrencySymbol('$')).toBe('Currency Symbol: $');
    expect(displayCurrencySymbol('€')).toBe('Currency Symbol: €');
    expect(displayCurrencySymbol('£')).toBe('Currency Symbol: £');
});
