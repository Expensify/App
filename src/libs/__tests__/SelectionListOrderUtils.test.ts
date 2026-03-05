import {moveInitialSelectionToTopByKey, moveInitialSelectionToTopByValue} from '@libs/SelectionListOrderUtils';

describe('SelectionListOrderUtils', () => {
    it('returns the original ordering when under threshold or empty selection', () => {
        const keys = ['USD', 'EUR', 'GBP'];
        expect(moveInitialSelectionToTopByKey(keys, [])).toEqual(keys);
        expect(moveInitialSelectionToTopByKey(keys, ['EUR'])).toEqual(keys);
    });

    it('moves initial selections to the top while preserving relative order', () => {
        const keys = ['USD', 'EUR', 'AUD', 'JPY', 'CAD', 'CHF', 'CNY', 'INR', 'BRL'];
        const result = moveInitialSelectionToTopByKey(keys, ['AUD', 'USD']);
        expect(result).toEqual(['USD', 'AUD', 'EUR', 'JPY', 'CAD', 'CHF', 'CNY', 'INR', 'BRL']);
    });

    it('reorders items by value and keeps duplicates stable', () => {
        const items = [
            {value: 'USD', id: 1},
            {value: 'EUR', id: 2},
            {value: 'USD', id: 3},
            {value: 'JPY', id: 4},
            {value: 'EUR', id: 5},
            {value: 'AUD', id: 6},
            {value: 'CAD', id: 7},
            {value: 'CHF', id: 8},
            {value: 'BRL', id: 9},
        ];

        const result = moveInitialSelectionToTopByValue(items, ['EUR', 'USD']);

        expect(result.map((item) => item.id)).toEqual([2, 5, 1, 3, 4, 6, 7, 8, 9]);
    });
});
