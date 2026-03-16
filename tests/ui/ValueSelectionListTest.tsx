import type * as ReactNavigation from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import React from 'react';
import SelectionList from '@components/SelectionList';
import ValueSelectionList from '@components/ValuePicker/ValueSelectionList';
import CONST from '@src/CONST';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/RadioListItem', () => jest.fn(() => null));

describe('ValueSelectionList', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const items = Array.from({length: CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 2}, (_, index) => ({
        value: `value-${index}`,
        label: `Label ${index}`,
        description: `Description ${index}`,
    }));

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the initial value to the top and disables focus-driven scroll', () => {
        render(
            <ValueSelectionList
                items={items}
                selectedItem={items.at(-1)}
                onItemSelected={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: items.at(-1)?.value,
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe(items.at(-1)?.value);
        expect(selectionListProps?.shouldUpdateFocusedIndex).toBeUndefined();
        expect(selectionListProps?.shouldScrollToFocusedIndex).toBe(false);
        expect(selectionListProps?.shouldScrollToFocusedIndexOnMount).toBe(false);
    });

    it('keeps the initially pinned value at the top while the live selection changes during the same mount', () => {
        const {rerender} = render(
            <ValueSelectionList
                items={items}
                selectedItem={items.at(-1)}
                onItemSelected={jest.fn()}
            />,
        );

        rerender(
            <ValueSelectionList
                items={items}
                selectedItem={items.at(-2)}
                onItemSelected={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: items.at(-1)?.value,
                isSelected: false,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe(items.at(-1)?.value);
        expect(selectionListProps?.data.find((item) => item.keyForList === items.at(-2)?.value)).toEqual(
            expect.objectContaining({
                keyForList: items.at(-2)?.value,
                isSelected: true,
            }),
        );
    });
});
