import {renderHook} from '@testing-library/react-native';

import type CalendarPickerListItem from '@components/DatePicker/CalendarPicker/types';
import useFlattenedSections, {shouldTreatItemAsDisabled} from '@components/SelectionList/hooks/useFlattenedSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';

import {createElement} from 'react';
import {View} from 'react-native';

describe('useFlattenedSections', () => {
    const sections: Array<Section<CalendarPickerListItem>> = [
        {
            sectionIndex: 0,
            title: 'First',
            data: [
                {keyForList: 'same', value: 1, isSelected: true, isDisabled: true},
                {keyForList: 'off', value: 2, isDisabled: true},
            ],
        },
        {sectionIndex: 1, customHeader: createElement(View), isDisabled: true, data: [{keyForList: 'same', value: 3, isSelected: true}]},
        {sectionIndex: 2, title: 'Empty', data: []},
    ];

    it('preserves headers, rows, selection, disability, focus, and specialized fields', () => {
        // Given selected-disabled, ordinary-disabled, section-disabled, repeated-key, and empty sections.
        // When the real hook flattens them with a repeated focus key.
        const {result} = renderHook(() => useFlattenedSections(sections, 'same'));
        // Then headers and rows retain ordering, keys, counts, flags, and the first matching focus.
        expect(result.current.flattenedData.map((item) => ('flatListKey' in item ? item.flatListKey : item.keyForList))).toEqual(['header-0', '0-same', '0-off', 'header-1', '1-same']);
        expect(result.current.flattenedData.at(0)).toMatchObject({title: 'First', isDisabled: true});
        expect(result.current.flattenedData.at(3)).toMatchObject({customHeader: sections.at(1)?.customHeader, isDisabled: true});
        expect(result.current.flattenedData.at(4)).toMatchObject({value: 3, isDisabled: true});
        expect(result.current.selectedItems.map((item) => item.value)).toEqual([1, 3]);
        expect(result.current.disabledIndexes).toEqual([0, 2, 3, 4]);
        expect(result.current.itemsCount).toBe(3);
        expect(result.current.initialFocusedIndex).toBe(1);
        expect(result.current.firstFocusableIndex).toBe(1);
        expect(result.current.selectedItems.some(shouldTreatItemAsDisabled)).toBe(false);
    });

    it('reuses unchanged inputs and recomputes when the focus or sections change', () => {
        // Given the shared sections and a focus key that matches two rows.
        const {result, rerender} = renderHook(({data, focus}: {data: Array<Section<CalendarPickerListItem>>; focus: string}) => useFlattenedSections(data, focus), {
            initialProps: {data: sections, focus: 'same'},
        });
        const first = result.current;
        // When the inputs stay the same.
        rerender({data: sections, focus: 'same'});
        // Then the compiled hook reuses its result.
        expect(result.current).toBe(first);
        // When the focus changes.
        rerender({data: sections, focus: 'missing'});
        // Then the hook recomputes it without a matching row.
        expect(result.current).not.toBe(first);
        expect(result.current.initialFocusedIndex).toBe(-1);
        const changedFocus = result.current;
        // When the sections change to an empty list.
        rerender({data: [{sectionIndex: 0, title: 'Empty', data: []}], focus: 'missing'});
        // Then the hook recomputes all derived fields.
        expect(result.current).not.toBe(changedFocus);
        expect(result.current).toEqual({flattenedData: [], disabledIndexes: [], itemsCount: 0, selectedItems: [], initialFocusedIndex: -1, firstFocusableIndex: 0});
    });
});
