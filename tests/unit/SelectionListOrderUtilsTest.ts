import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import CONST from '@src/CONST';

describe('SelectionListOrderUtils', () => {
    describe('moveInitialSelectionToTop', () => {
        it('does not reorder values when the list is under the global threshold', () => {
            const items = Array.from({length: CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD}, (_, index) => ({
                value: `item-${index}`,
                keyForList: `item-${index}`,
            }));

            expect(moveInitialSelectionToTop(items, ['item-3'])).toEqual(items);
        });

        it('moves the initially selected values to the top while preserving source order', () => {
            const items = Array.from({length: CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 2}, (_, index) => ({
                value: `item-${index}`,
                keyForList: `item-${index}`,
            }));
            const selectedValues = [`item-${CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD}`, `item-${CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 1}`];

            const reorderedItems = moveInitialSelectionToTop(items, selectedValues);

            expect(reorderedItems.map((item) => item.value)).toEqual([...selectedValues, ...items.filter((item) => !selectedValues.includes(item.value)).map((item) => item.value)]);
        });

        it('returns the items unchanged when initialSelectedValues is empty, even above the threshold', () => {
            const items = Array.from({length: CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 5}, (_, index) => ({
                value: `item-${index}`,
                keyForList: `item-${index}`,
            }));

            expect(moveInitialSelectionToTop(items, [])).toBe(items);
        });

        it('ignores selected values that are not present in the source items', () => {
            const items = Array.from({length: CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 3}, (_, index) => ({
                value: `item-${index}`,
                keyForList: `item-${index}`,
            }));
            const selectedValues = ['not-in-list', `item-${CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD}`];

            const reorderedItems = moveInitialSelectionToTop(items, selectedValues);

            expect(reorderedItems.at(0)?.value).toBe(`item-${CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD}`);
            expect(reorderedItems).toHaveLength(items.length);
            expect(reorderedItems.some((item) => item.value === 'not-in-list')).toBe(false);
        });

        it('preserves source order among selected items when multiple appear out of order in initialSelectedValues', () => {
            const items = Array.from({length: CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 3}, (_, index) => ({
                value: `item-${index}`,
                keyForList: `item-${index}`,
            }));
            // Pass the selected values in reverse order — the result should still follow source order.
            const last = `item-${CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 2}`;
            const first = `item-${CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD}`;
            const reorderedItems = moveInitialSelectionToTop(items, [last, first]);

            expect(reorderedItems.slice(0, 2).map((item) => item.value)).toEqual([first, last]);
        });
    });
});
