import moveInitialSelectionToTop, {buildFrozenSection, excludeFrozenItems} from '@libs/SelectionListOrderUtils';
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
    });

    describe('buildFrozenSection', () => {
        it('refreshes isSelected on each row from the predicate without reordering', () => {
            const frozen = [
                {id: 1, isSelected: true},
                {id: 2, isSelected: true},
                {id: 3, isSelected: true},
            ];
            const isCurrentlySelected = (item: {id: number}) => item.id !== 2;

            expect(buildFrozenSection(frozen, isCurrentlySelected)).toEqual([
                {id: 1, isSelected: true},
                {id: 2, isSelected: false},
                {id: 3, isSelected: true},
            ]);
        });

        it('preserves all other fields on the row', () => {
            const frozen = [{id: 1, label: 'first', isSelected: false}];
            expect(buildFrozenSection(frozen, () => true)).toEqual([{id: 1, label: 'first', isSelected: true}]);
        });

        it('returns a new array on every call so React sees a fresh reference', () => {
            const frozen = [{id: 1, isSelected: true}];
            expect(buildFrozenSection(frozen, () => true)).not.toBe(frozen);
        });
    });

    describe('excludeFrozenItems', () => {
        it('drops the items the predicate marks as frozen', () => {
            const items = [{id: 1}, {id: 2}, {id: 3}];
            const isFrozen = (item: {id: number}) => item.id === 2;

            expect(excludeFrozenItems(items, isFrozen)).toEqual([{id: 1}, {id: 3}]);
        });

        it('returns every item when the predicate matches nothing', () => {
            const items = [{id: 1}, {id: 2}];
            expect(excludeFrozenItems(items, () => false)).toEqual(items);
        });

        it('returns an empty array when the predicate matches everything', () => {
            const items = [{id: 1}, {id: 2}];
            expect(excludeFrozenItems(items, () => true)).toEqual([]);
        });
    });
});
