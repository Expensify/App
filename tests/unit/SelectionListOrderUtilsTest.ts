import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import CONST from '@src/CONST';

describe('SelectionListOrderUtils', () => {
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
});
