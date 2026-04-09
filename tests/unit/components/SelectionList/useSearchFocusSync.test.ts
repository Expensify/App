import {renderHook} from '@testing-library/react-native';
import useSearchFocusSync from '@components/SelectionList/hooks/useSearchFocusSync';

type MockItem = {
    keyForList: string;
    isSelected?: boolean;
};

describe('useSearchFocusSync', () => {
    it('focuses the selected row when the debounced search is cleared and the full list returns', () => {
        const scrollToIndex = jest.fn();
        const setFocusedIndex = jest.fn();
        const filteredData: MockItem[] = [{keyForList: 'match'}];
        const fullData: MockItem[] = [{keyForList: 'a'}, {keyForList: 'b'}, {keyForList: 'selected', isSelected: true}, {keyForList: 'c'}];

        const {rerender} = renderHook(
            ({searchValue, data}: {searchValue: string; data: MockItem[]}) =>
                useSearchFocusSync({
                    searchValue,
                    data,
                    selectedOptionsCount: data.filter((item) => item.isSelected).length,
                    isItemSelected: (item) => !!item.isSelected,
                    canSelectMultiple: false,
                    shouldUpdateFocusedIndex: false,
                    scrollToIndex,
                    setFocusedIndex,
                }),
            {
                initialProps: {
                    searchValue: 'uni',
                    data: filteredData,
                },
            },
        );

        rerender({
            searchValue: '',
            data: fullData,
        });

        expect(scrollToIndex).toHaveBeenCalledWith(2);
        expect(setFocusedIndex).toHaveBeenCalledWith(2);
    });
});
