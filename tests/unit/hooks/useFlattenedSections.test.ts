import {renderHook} from '@testing-library/react-native';

import useFlattenedSections, {shouldTreatItemAsDisabled} from '@components/SelectionList/hooks/useFlattenedSections';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';

import {createElement} from 'react';

type SpecialItem = ListItem & {specialID: number};

describe('useFlattenedSections', () => {
    it('preserves headers, rows, selection, disability, focus, and specialized fields', () => {
        // Given selected-disabled, ordinary-disabled, section-disabled, repeated-key, and empty sections.
        const sections: Array<Section<SpecialItem>> = [
            {
                sectionIndex: 0,
                title: 'First',
                data: [
                    {keyForList: 'same', specialID: 1, isSelected: true, isDisabled: true},
                    {keyForList: 'off', specialID: 2, isDisabled: true},
                ],
            },
            {sectionIndex: 1, customHeader: createElement('div'), isDisabled: true, data: [{keyForList: 'same', specialID: 3, isSelected: true}]},
            {sectionIndex: 2, title: 'Empty', data: []},
        ];
        // When the real hook flattens them with a repeated focus key.
        const {result, rerender} = renderHook(({data, focus}: {data: Array<Section<SpecialItem>>; focus: string}) => useFlattenedSections(data, focus), {
            initialProps: {data: sections, focus: 'same'},
        });
        // Then headers and rows retain ordering, keys, counts, flags, and the first matching focus.
        expect(result.current.flattenedData.map((item) => ('flatListKey' in item ? item.flatListKey : item.keyForList))).toEqual(['header-0', '0-same', '0-off', 'header-1', '1-same']);
        expect(result.current.flattenedData.at(0)).toMatchObject({title: 'First', isDisabled: true});
        expect(result.current.flattenedData.at(3)).toMatchObject({customHeader: sections.at(1)?.customHeader, isDisabled: true});
        expect(result.current.flattenedData.at(4)).toMatchObject({specialID: 3, isDisabled: true});
        expect(result.current.selectedItems.map((item) => item.specialID)).toEqual([1, 3]);
        expect(result.current.disabledIndexes).toEqual([0, 2, 3, 4]);
        expect([result.current.itemsCount, result.current.initialFocusedIndex, result.current.firstFocusableIndex]).toEqual([3, 1, 1]);
        expect(result.current.selectedItems.some(shouldTreatItemAsDisabled)).toBe(false);
        // Given the same inputs, then a changed focus and an empty section reference.
        const first = result.current;
        // When the hook rerenders for each input.
        rerender({data: sections, focus: 'same'});
        // Then unchanged inputs reuse the result, while each changed input recomputes it.
        expect(result.current).toBe(first);
        rerender({data: sections, focus: 'missing'});
        expect(result.current).not.toBe(first);
        expect(result.current.initialFocusedIndex).toBe(-1);
        const changedFocus = result.current;
        rerender({data: [{sectionIndex: 0, title: 'Empty', data: []}], focus: 'missing'});
        expect(result.current).not.toBe(changedFocus);
        expect(result.current).toEqual({flattenedData: [], disabledIndexes: [], itemsCount: 0, selectedItems: [], initialFocusedIndex: -1, firstFocusableIndex: 0});
    });
});
