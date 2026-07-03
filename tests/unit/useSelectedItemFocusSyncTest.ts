import {renderHook} from '@testing-library/react-native';

import useSelectedItemFocusSync from '@components/SelectionList/hooks/useSelectedItemFocusSync';

type Item = {keyForList: string; text: string; isSelected: boolean};

const isItemSelected = (item: Item) => item.isSelected;

const buildItems = (length: number, selectedIndex: number): Item[] =>
    Array.from({length}, (_, i) => ({
        keyForList: `item-${i}`,
        text: `Item ${i}`,
        isSelected: i === selectedIndex,
    }));

describe('useSelectedItemFocusSync', () => {
    it('passes shouldScrollHint: true when the selected item becomes known after mount', () => {
        const setFocusedIndex = jest.fn();
        // Mount with the selected key known but data not yet loaded.
        // The memo returns -1, so the effect bails on first render.
        const initialProps = {
            data: [] as Item[],
            initiallyFocusedItemKey: 'item-5' as string | undefined,
            isItemSelected,
            focusedIndex: 0,
            searchValue: undefined as string | undefined,
            setFocusedIndex,
        };
        const {rerender} = renderHook((props: typeof initialProps) => useSelectedItemFocusSync(props), {initialProps});

        expect(setFocusedIndex).not.toHaveBeenCalled();

        // Async data arrives: the selected row is now at index 5.
        // Regression guard for PR #91605: the sync path must pass shouldScrollHint: true
        // so the consumer scrolls — FlashList's initialScrollIndex has already been consumed.
        rerender({...initialProps, data: buildItems(10, 5)});

        expect(setFocusedIndex).toHaveBeenCalledTimes(1);
        expect(setFocusedIndex).toHaveBeenCalledWith(5, true);
    });

    it('does not call setFocusedIndex when the cursor is already on the selected item', () => {
        const setFocusedIndex = jest.fn();
        renderHook(() =>
            useSelectedItemFocusSync({
                data: buildItems(10, 3),
                initiallyFocusedItemKey: 'item-3',
                isItemSelected,
                focusedIndex: 3,
                searchValue: undefined,
                setFocusedIndex,
            }),
        );

        expect(setFocusedIndex).not.toHaveBeenCalled();
    });

    it('does not call setFocusedIndex while a search is active', () => {
        const setFocusedIndex = jest.fn();
        renderHook(() =>
            useSelectedItemFocusSync({
                data: buildItems(10, 5),
                initiallyFocusedItemKey: 'item-5',
                isItemSelected,
                focusedIndex: 0,
                searchValue: 'item',
                setFocusedIndex,
            }),
        );

        expect(setFocusedIndex).not.toHaveBeenCalled();
    });
});
