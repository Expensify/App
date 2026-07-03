import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';

import CONST from '@src/CONST';

type Item = {value: string; keyForList: string};

/**
 * Build `count` items with values `item-0`, `item-1`, ... so the relative order is easy to assert against.
 */
const buildItems = (count: number): Item[] =>
    Array.from({length: count}, (_, index) => ({
        value: `item-${index}`,
        keyForList: `item-${index}`,
    }));

const valuesOf = (items: Item[]): string[] => items.map((item) => item.value);

describe('SelectionListOrderUtils', () => {
    describe('moveInitialSelectionToTop', () => {
        it('returns the same array reference when there are no initial selections', () => {
            const items = buildItems(CONST.STANDARD_LIST_ITEM_LIMIT);

            expect(moveInitialSelectionToTop(items, [])).toBe(items);
        });

        it('does not reorder values when the list is under the global threshold', () => {
            // One item short of the limit, so the early-return keeps the list untouched even with a selection.
            const items = buildItems(CONST.STANDARD_LIST_ITEM_LIMIT - 1);

            expect(moveInitialSelectionToTop(items, ['item-3'])).toEqual(items);
        });

        it('reorders once the list reaches the global threshold (boundary is inclusive)', () => {
            const items = buildItems(CONST.STANDARD_LIST_ITEM_LIMIT);

            const reorderedItems = moveInitialSelectionToTop(items, ['item-3']);

            expect(valuesOf(reorderedItems).at(0)).toBe('item-3');
        });

        it('moves the initially selected values to the top while preserving source order', () => {
            const items = buildItems(CONST.STANDARD_LIST_ITEM_LIMIT + 2);
            const selectedValues = [`item-${CONST.STANDARD_LIST_ITEM_LIMIT}`, `item-${CONST.STANDARD_LIST_ITEM_LIMIT + 1}`];

            const reorderedItems = moveInitialSelectionToTop(items, selectedValues);

            expect(valuesOf(reorderedItems)).toEqual([...selectedValues, ...valuesOf(items.filter((item) => !selectedValues.includes(item.value)))]);
        });

        it('follows the source list order for selected rows, not the order of the passed-in selection', () => {
            const items = buildItems(CONST.STANDARD_LIST_ITEM_LIMIT);
            // Selected values are passed out of order to prove the output follows the original list order.
            const reorderedItems = moveInitialSelectionToTop(items, ['item-9', 'item-3', 'item-7']);

            expect(valuesOf(reorderedItems)).toEqual(['item-3', 'item-7', 'item-9', 'item-0', 'item-1', 'item-2', 'item-4', 'item-5', 'item-6', 'item-8', 'item-10', 'item-11']);
        });

        it('ignores initial selections that are not present in the list', () => {
            const items = buildItems(CONST.STANDARD_LIST_ITEM_LIMIT);

            const reorderedItems = moveInitialSelectionToTop(items, ['does-not-exist', 'item-5']);

            expect(valuesOf(reorderedItems).at(0)).toBe('item-5');
            // No phantom rows are introduced and nothing is dropped.
            expect(reorderedItems).toHaveLength(items.length);
            expect(valuesOf(reorderedItems)).toEqual(expect.arrayContaining(valuesOf(items)));
        });

        it('leaves the order unchanged when none of the initial selections match', () => {
            const items = buildItems(CONST.STANDARD_LIST_ITEM_LIMIT);

            expect(valuesOf(moveInitialSelectionToTop(items, ['item-100', 'item-200']))).toEqual(valuesOf(items));
        });

        it('keeps every item exactly once (no loss or duplication)', () => {
            const items = buildItems(CONST.STANDARD_LIST_ITEM_LIMIT + 5);

            const reorderedItems = moveInitialSelectionToTop(items, ['item-1', 'item-4', 'item-15']);

            expect([...valuesOf(reorderedItems)].sort()).toEqual([...valuesOf(items)].sort());
        });

        it('keeps the order unchanged when every item is pre-selected', () => {
            const items = buildItems(CONST.STANDARD_LIST_ITEM_LIMIT);

            expect(valuesOf(moveInitialSelectionToTop(items, valuesOf(items)))).toEqual(valuesOf(items));
        });
    });
});
