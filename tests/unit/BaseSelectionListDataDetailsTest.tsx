import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import type * as ReactNavigation from '@react-navigation/native';

import {render, screen} from '@testing-library/react-native';
import React from 'react';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        useIsFocused: () => true,
        useNavigation: () => ({addListener: jest.fn(() => jest.fn()), dispatch: jest.fn()}),
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

function getSelectAllCheckboxCheckedState() {
    return (screen.getByTestId('selection-list-select-all-checkbox').props as {accessibilityState: {checked: boolean | 'mixed'}}).accessibilityState.checked;
}

function renderSelectionList(data: ListItem[], onSelectAll?: () => void) {
    return render(
        <SelectionList
            data={data}
            ListItem={MultiSelectListItem}
            canSelectMultiple
            onSelectRow={() => {}}
            onSelectAll={onSelectAll}
        />,
    );
}

describe('BaseSelectionList dataDetails', () => {
    describe('disabled+selected items are excluded from allSelected calculation', () => {
        it('should show allSelected when all selectable items are selected, ignoring force-selected disabled items', () => {
            const data: ListItem[] = [
                {keyForList: 'a', text: 'Item A', isSelected: true, isDisabled: false},
                {keyForList: 'b', text: 'Item B', isSelected: true, isDisabled: false},
                {keyForList: 'c', text: 'Item C', isSelected: true, isDisabled: true, isDisabledCheckbox: true},
                {keyForList: 'd', text: 'Item D', isSelected: true, isDisabled: true, isDisabledCheckbox: true},
            ];

            renderSelectionList(data, () => {});

            expect(getSelectAllCheckboxCheckedState()).toBe(true);
        });

        it('should show someSelected (indeterminate) when only some selectable items are selected', () => {
            const data: ListItem[] = [
                {keyForList: 'a', text: 'Item A', isSelected: true, isDisabled: false},
                {keyForList: 'b', text: 'Item B', isSelected: false, isDisabled: false},
                {keyForList: 'c', text: 'Item C', isSelected: true, isDisabled: true, isDisabledCheckbox: true},
            ];

            renderSelectionList(data, () => {});

            expect(getSelectAllCheckboxCheckedState()).toBe('mixed');
        });

        it('should not show allSelected when no selectable items are selected even with disabled+selected items', () => {
            const data: ListItem[] = [
                {keyForList: 'a', text: 'Item A', isSelected: false, isDisabled: false},
                {keyForList: 'b', text: 'Item B', isSelected: false, isDisabled: false},
                {keyForList: 'c', text: 'Item C', isSelected: true, isDisabled: true, isDisabledCheckbox: true},
            ];

            renderSelectionList(data, () => {});

            expect(getSelectAllCheckboxCheckedState()).toBe(false);
        });
    });
});
