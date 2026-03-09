import {renderHook} from '@testing-library/react-native';
import useSelectedItemFocusSync from '@components/SelectionList/hooks/useSelectedItemFocusSync';

type TestItem = {
    keyForList: string;
    isSelected?: boolean;
};

describe('useSelectedItemFocusSync', () => {
    const data: TestItem[] = [{keyForList: 'first', isSelected: true}, {keyForList: 'second'}, {keyForList: 'third'}];

    it('should keep focus on the keyed item when selection changes but the focused key does not', () => {
        const setFocusedIndex = jest.fn();
        const {rerender} = renderHook(
            ({items, focusedIndex}: {items: TestItem[]; focusedIndex: number}) =>
                useSelectedItemFocusSync({
                    data: items,
                    initiallyFocusedItemKey: 'first',
                    focusedIndex,
                    searchValue: '',
                    setFocusedIndex,
                }),
            {
                initialProps: {
                    items: data,
                    focusedIndex: 0,
                },
            },
        );

        rerender({
            items: [{keyForList: 'first'}, {keyForList: 'second', isSelected: true}, {keyForList: 'third'}],
            focusedIndex: 0,
        });

        expect(setFocusedIndex).not.toHaveBeenCalled();
    });

    it('should update focus when the focused key changes', () => {
        const setFocusedIndex = jest.fn();
        const {rerender} = renderHook(
            ({focusedKey}: {focusedKey: string}) =>
                useSelectedItemFocusSync({
                    data,
                    initiallyFocusedItemKey: focusedKey,
                    focusedIndex: 0,
                    searchValue: '',
                    setFocusedIndex,
                }),
            {
                initialProps: {
                    focusedKey: 'first',
                },
            },
        );

        rerender({focusedKey: 'third'});

        expect(setFocusedIndex).toHaveBeenCalledWith(2);
    });

    it('should not sync focus while search is active', () => {
        const setFocusedIndex = jest.fn();

        renderHook(() =>
            useSelectedItemFocusSync({
                data,
                initiallyFocusedItemKey: 'third',
                focusedIndex: 0,
                searchValue: 'th',
                setFocusedIndex,
            }),
        );

        expect(setFocusedIndex).not.toHaveBeenCalled();
    });
});
