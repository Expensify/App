import {act, render} from '@testing-library/react-native';

import YearPickerModal from '@components/DatePicker/CalendarPicker/YearPickerModal';
import SelectionList from '@components/SelectionList';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // useInitialSelection calls useFocusEffect. No-op it so the modal renders without a navigator.
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@components/Modal', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

type MockSelectionListProps = {
    data: Array<{value?: number; keyForList?: string}>;
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    textInputOptions?: {onChangeText?: (value: string) => void};
};

/** Build `count` year items starting at `start` (e.g. 2014 → 2014..2027). */
function buildYears(start: number, count: number) {
    return Array.from({length: count}, (_, index) => {
        const year = start + index;
        return {text: String(year), value: year, keyForList: String(year)};
    });
}

describe('YearPickerModal', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the current year to the top on open', () => {
        // Given a year list long enough for the pin to apply
        render(
            <YearPickerModal
                isVisible
                years={buildYears(2014, 14)}
                currentYear={2020}
                onClose={jest.fn()}
            />,
        );

        // When the picker opens
        const props = getSelectionListProps();

        // Then the current year leads the list and is the focused item
        expect(props?.data.at(0)?.value).toBe(2020);
        expect(props?.initiallyFocusedItemKey).toBe('2020');
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('lists upcoming years ascending, then past years nearest first, after the pinned year', () => {
        // Given a year list long enough for the pin to apply, with 2020 selected
        render(
            <YearPickerModal
                isVisible
                years={buildYears(2014, 14)}
                currentYear={2020}
                onClose={jest.fn()}
            />,
        );

        // When the picker opens
        const values = getSelectionListProps()?.data.map((year) => year.value);

        // Then the row after the pinned year is the next year, not the latest year in the list
        expect(values).toEqual([2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2019, 2018, 2017, 2016, 2015, 2014]);
    });

    it.each([
        // The newest year is selected, so there are no upcoming years and only past years follow, nearest first
        [2027, [2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014]],
        // The oldest year is selected, so there are no past years and only upcoming years follow, ascending
        [2014, [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027]],
    ])('orders correctly when %i is at the edge of the list', (currentYear, expected) => {
        // Given a year list long enough for the pin to apply, with a year at one end of the list selected
        render(
            <YearPickerModal
                isVisible
                years={buildYears(2014, 14)}
                currentYear={currentYear}
                onClose={jest.fn()}
            />,
        );

        // When the picker opens
        const values = getSelectionListProps()?.data.map((year) => year.value);

        // Then the selected year leads and the rest of the list is ordered from the only side that has years
        expect(values).toEqual(expected);
    });

    it('keeps the current year pinned at the top of the search results', () => {
        // Given a year list long enough for the pin to apply, with 2024 selected so "202" matches years on both sides of it
        render(
            <YearPickerModal
                isVisible
                years={buildYears(2014, 14)}
                currentYear={2024}
                onClose={jest.fn()}
            />,
        );

        // When the user searches "202", which matches 2020-2027
        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('202');
        });

        // Then 2024 stays first, the upcoming years follow in ascending order, and the past years come last, nearest first
        expect(getSelectionListProps()?.data.map((year) => year.value)).toEqual([2024, 2025, 2026, 2027, 2023, 2022, 2021, 2020]);
    });

    it('does not reorder when the year list is under the item-limit threshold', () => {
        // Given a year list shorter than the item-limit threshold
        render(
            <YearPickerModal
                isVisible
                years={buildYears(2020, 5)}
                currentYear={2022}
                onClose={jest.fn()}
            />,
        );

        // When the picker opens
        const values = getSelectionListProps()?.data.map((year) => year.value);

        // Then nothing is pinned and the newest-first order is kept
        expect(values).toEqual([2024, 2023, 2022, 2021, 2020]);
    });
});
