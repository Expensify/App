import {act, render} from '@testing-library/react-native';

import MonthPickerModal from '@components/DatePicker/CalendarPicker/MonthPickerModal';
import SelectionList from '@components/SelectionList';

import type {PropsWithChildren} from 'react';

import React from 'react';

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@components/Modal', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

type MockSelectionListProps = {
    data: Array<{value?: number; text?: string; isSelected?: boolean; isDisabled?: boolean | null}>;
    initiallyFocusedItemKey?: string;
    textInputOptions?: {onChangeText?: (value: string) => void};
};

describe('MonthPickerModal', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('lists all 12 months with only the current month selected and focused', () => {
        // Given a shown year whose months can all be picked, with June shown
        render(
            <MonthPickerModal
                isVisible
                currentMonth={5}
                minMonth={0}
                maxMonth={11}
                onClose={jest.fn()}
            />,
        );

        // When the picker opens
        const props = getSelectionListProps();

        // Then every month is a row in order, and only June is selected and focused, because the modal builds the rows itself from these numbers
        expect(props?.data.map((month) => month.text)).toEqual(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);
        expect(props?.data.filter((month) => month.isSelected).map((month) => month.value)).toEqual([5]);
        expect(props?.initiallyFocusedItemKey).toBe('5');
    });

    it('greys out the months outside minMonth and maxMonth', () => {
        // Given a shown year where only April to September can be picked
        render(
            <MonthPickerModal
                isVisible
                currentMonth={5}
                minMonth={3}
                maxMonth={8}
                onClose={jest.fn()}
            />,
        );

        // When the picker opens
        const data = getSelectionListProps()?.data ?? [];

        // Then the months before April and after September are listed but disabled, so the list never shows "No results found" for a valid year
        expect(data).toHaveLength(12);
        expect(data.filter((month) => month.isDisabled).map((month) => month.value)).toEqual([0, 1, 2, 9, 10, 11]);
    });

    it('keeps months outside the range greyed out while searching', () => {
        // Given a shown year where only July onward can be picked
        render(
            <MonthPickerModal
                isVisible
                currentMonth={6}
                minMonth={6}
                maxMonth={11}
                onClose={jest.fn()}
            />,
        );

        // When the user searches "ju", which matches June and July
        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('ju');
        });

        // Then June stays disabled and July can be picked, because searching filters the rows without changing which months are allowed
        const data = getSelectionListProps()?.data ?? [];
        expect(data.map((month) => [month.text, !!month.isDisabled])).toEqual([
            ['June', true],
            ['July', false],
        ]);
    });
});
