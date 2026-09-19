import {act, render} from '@testing-library/react-native';

import MonthPickerModal from '@components/DatePicker/CalendarPicker/MonthPickerModal';
import SelectionList from '@components/SelectionList';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key, dateFnsLocale: {}})));
jest.mock('@libs/DateUtils', () => ({
    __esModule: true,
    default: {
        getMonthNames: () => MONTH_NAMES,
        getFilteredMonthItems: (names: string[], current: number) => names.map((month, index) => ({text: month, value: index, keyForList: index.toString(), isSelected: index === current})),
    },
}));

type MockSelectionListProps = {
    data: Array<{value?: number; keyForList?: string}>;
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    textInputOptions?: {onChangeText?: (value: string) => void};
};

describe('MonthPickerModal', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the current month to the top on open', () => {
        // 6 = July, which sits mid-list, so seeing it first proves pinning.
        render(
            <MonthPickerModal
                isVisible
                currentMonth={6}
                onClose={jest.fn()}
            />,
        );

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe(6);
        // January (0) is the natural first row.
        expect(props?.data.at(0)?.value).not.toBe(0);
        expect(props?.initiallyFocusedItemKey).toBe('6');
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the current month pinned at the top of the search results', () => {
        render(
            <MonthPickerModal
                isVisible
                currentMonth={6}
                onClose={jest.fn()}
            />,
        );

        // "j" matches January, June and July. January sorts first, so July leading proves the pin held.
        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('j');
        });

        expect(getSelectionListProps()?.data.at(0)?.value).toBe(6);
    });
});
