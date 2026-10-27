import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';
import ValueSelectionList from '@components/ValuePicker/ValueSelectionList';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

describe('ValueSelectionList', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const items = Array.from({length: CONST.STANDARD_LIST_ITEM_LIMIT + 2}, (_, index) => ({
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
        expect(selectionListProps?.shouldScrollToFocusedIndexOnMount).toBe(false);
    });

    it('hides the search input when the list has fewer items than the standard limit', () => {
        // Given a list just below the limit, where scanning is easy without search
        const shortItems = items.slice(0, CONST.STANDARD_LIST_ITEM_LIMIT - 1);

        // When the list renders
        render(
            <ValueSelectionList
                items={shortItems}
                onItemSelected={jest.fn()}
            />,
        );

        // Then no search label is passed, so SelectionList shows no input and keeps its default focus behavior
        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.textInputOptions?.label).toBeUndefined();
        expect(selectionListProps?.shouldUpdateFocusedIndex).toBe(false);
        expect(selectionListProps?.disableMaintainingScrollPosition).toBe(false);
    });

    it('shows the search input when the list reaches the standard limit', () => {
        // Given a list at the limit, such as a user with 12 workspaces on the new room page
        const limitItems = items.slice(0, CONST.STANDARD_LIST_ITEM_LIMIT);

        // When the list renders
        render(
            <ValueSelectionList
                items={limitItems}
                onItemSelected={jest.fn()}
            />,
        );

        // Then the search input is shown with the scroll-stability props searchable lists use
        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.textInputOptions?.label).toBe('common.search');
        expect(selectionListProps?.shouldUpdateFocusedIndex).toBe(true);
        expect(selectionListProps?.disableMaintainingScrollPosition).toBe(true);
    });

    describe('searching', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
        });

        const search = (value: string) => {
            act(() => {
                mockedSelectionList.mock.lastCall?.[0]?.textInputOptions?.onChangeText?.(value);
            });
            act(() => {
                jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME);
            });
        };

        it('filters the options by label and keeps the search input visible', () => {
            // Given a searchable list
            render(
                <ValueSelectionList
                    items={items}
                    onItemSelected={jest.fn()}
                />,
            );

            // When the user searches for one label
            search('Label 13');

            // Then only the matching option remains, and the input stays because it is gated on the unfiltered length
            const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
            expect(selectionListProps?.data.map((item) => item.keyForList)).toEqual(['value-13']);
            expect(selectionListProps?.textInputOptions?.label).toBe('common.search');
            expect(selectionListProps?.textInputOptions?.headerMessage).toBeUndefined();
        });

        it('shows the no-results message when the search matches nothing', () => {
            // Given a searchable list
            render(
                <ValueSelectionList
                    items={items}
                    onItemSelected={jest.fn()}
                />,
            );

            // When the user searches for text no option contains
            search('zzzz');

            // Then the list is empty and the user is told nothing matched
            const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
            expect(selectionListProps?.data).toEqual([]);
            expect(selectionListProps?.textInputOptions?.headerMessage).toBe('common.noResultsFound');
        });
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
