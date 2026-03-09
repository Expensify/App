import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import Navigation from '@libs/Navigation/Navigation';
import RuleSelectionPicker from '@src/components/Rule/RuleSelectionPicker';
import CONST from '@src/CONST';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (left: string, right: string) => left.localeCompare(right),
    })),
);
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

function buildItems() {
    return Array.from({length: CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 2}, (_, index) => {
        const suffix = String.fromCharCode(65 + index);

        return {
            name: `Item ${suffix}`,
            value: suffix,
        };
    });
}

describe('RuleSelectionPicker', () => {
    const mockedSelectionListWithSections = jest.mocked(SelectionListWithSections);
    const mockedNavigation = jest.mocked(Navigation);
    const items = buildItems();
    const firstSelectedItem = items.at(1);
    const updatedSelectedItem = items.at(7);
    const searchedItem = items.at(0);
    const clickedItem = items.at(4);

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('keeps the initial item pinned and the focus target frozen while the selected value changes during the same mount', () => {
        expect(firstSelectedItem).toBeDefined();
        expect(updatedSelectedItem).toBeDefined();

        const {rerender} = render(
            <RuleSelectionPicker
                items={items}
                initiallySelectedItem={firstSelectedItem}
                onSaveSelection={jest.fn()}
                backToRoute="settings/rules"
            />,
        );

        const initialProps = mockedSelectionListWithSections.mock.lastCall?.[0];
        expect(initialProps).toBeDefined();
        expect(initialProps?.shouldUpdateFocusedIndex).toBeFalsy();
        expect(initialProps?.shouldScrollToTopOnSelect).toBe(false);
        expect(initialProps?.sections.at(0)?.data.at(0)).toEqual(expect.objectContaining({keyForList: firstSelectedItem?.value, isSelected: true}));
        expect(initialProps?.initiallyFocusedItemKey).toBe(firstSelectedItem?.value);

        rerender(
            <RuleSelectionPicker
                items={items}
                initiallySelectedItem={updatedSelectedItem}
                onSaveSelection={jest.fn()}
                backToRoute="settings/rules"
            />,
        );

        const updatedProps = mockedSelectionListWithSections.mock.lastCall?.[0];
        expect(updatedProps).toBeDefined();
        expect(updatedProps?.sections.at(0)?.data.at(0)).toEqual(expect.objectContaining({keyForList: firstSelectedItem?.value}));
        expect(updatedProps?.initiallyFocusedItemKey).toBe(firstSelectedItem?.value);
        expect(updatedProps?.sections.at(0)?.data.find((item) => item.keyForList === updatedSelectedItem?.value)).toEqual(expect.objectContaining({isSelected: true}));
    });

    it('filters search results without keeping the initial item pinned', () => {
        expect(updatedSelectedItem).toBeDefined();
        expect(searchedItem).toBeDefined();

        render(
            <RuleSelectionPicker
                items={items}
                initiallySelectedItem={updatedSelectedItem}
                onSaveSelection={jest.fn()}
                backToRoute="settings/rules"
            />,
        );

        const initialProps = mockedSelectionListWithSections.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('Item A');
            jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
        });

        const searchedProps = mockedSelectionListWithSections.mock.lastCall?.[0];
        expect(searchedProps?.sections).toHaveLength(1);
        expect(searchedProps?.sections.at(0)?.data).toEqual([expect.objectContaining({keyForList: searchedItem?.value})]);
    });

    it('saves the selected value and navigates back when a row is chosen', () => {
        expect(firstSelectedItem).toBeDefined();
        expect(clickedItem).toBeDefined();

        const onSaveSelection = jest.fn();

        render(
            <RuleSelectionPicker
                items={items}
                initiallySelectedItem={firstSelectedItem}
                onSaveSelection={onSaveSelection}
                backToRoute="settings/rules"
            />,
        );

        const selectionListProps = mockedSelectionListWithSections.mock.lastCall?.[0];
        const clickedValue = clickedItem?.value;
        expect(clickedValue).toBeDefined();
        if (!clickedValue) {
            throw new Error('Expected clicked rule value');
        }

        act(() => {
            selectionListProps?.onSelectRow({
                text: clickedItem?.name,
                keyForList: clickedValue,
                isSelected: false,
            });
        });

        expect(onSaveSelection).toHaveBeenCalledWith(clickedValue);
        expect(mockedNavigation.goBack).toHaveBeenCalledWith('settings/rules');
    });
});
