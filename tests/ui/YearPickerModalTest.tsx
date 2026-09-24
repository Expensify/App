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
        render(
            <YearPickerModal
                isVisible
                years={buildYears(2014, 14)}
                currentYear={2020}
                onClose={jest.fn()}
            />,
        );

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe(2020);
        // The list sorts newest-first, so 2027 would lead if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe(2027);
        expect(props?.initiallyFocusedItemKey).toBe('2020');
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the current year pinned at the top of the search results', () => {
        render(
            <YearPickerModal
                isVisible
                years={buildYears(2014, 14)}
                currentYear={2020}
                onClose={jest.fn()}
            />,
        );

        // "202" matches 2020-2027. 2027 sorts first, so 2020 leading proves the pin held.
        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('202');
        });

        expect(getSelectionListProps()?.data.at(0)?.value).toBe(2020);
    });

    it('does not reorder when the year list is under the item-limit threshold', () => {
        render(
            <YearPickerModal
                isVisible
                years={buildYears(2020, 5)}
                currentYear={2022}
                onClose={jest.fn()}
            />,
        );

        // Below the threshold moveInitialSelectionToTop is a no-op, so newest-first order is kept.
        expect(getSelectionListProps()?.data.at(0)?.value).toBe(2024);
    });
});
