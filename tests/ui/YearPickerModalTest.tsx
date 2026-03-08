import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import SelectionList from '@components/SelectionList';
import YearPickerModal from '@components/DatePicker/CalendarPicker/YearPickerModal';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/Modal', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        pb0: {},
    })),
);

function buildYears(selectedYear: number) {
    return Array.from({length: 16}, (_, index) => {
        const year = 2010 + index;

        return {
            text: year.toString(),
            value: year,
            keyForList: year.toString(),
            isSelected: year === selectedYear,
        };
    });
}

function renderYearPicker(currentYear: number, isVisible = true) {
    const years = buildYears(currentYear);
    const onClose = jest.fn();
    const onYearChange = jest.fn();

    return render(
        <YearPickerModal
            isVisible={isVisible}
            years={years}
            currentYear={currentYear}
            onYearChange={onYearChange}
            onClose={onClose}
        />,
    );
}

describe('YearPickerModal', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the initially selected year to the top and suppresses focused-item scrolling', () => {
        renderYearPicker(2018);

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        expect(initialProps).toBeDefined();
        expect(initialProps?.data.at(0)?.value).toBe(2018);
        expect(initialProps?.initiallyFocusedItemKey).toBe('2018');
        expect(initialProps?.shouldScrollToFocusedIndex).toBe(false);
        expect(initialProps?.shouldScrollToFocusedIndexOnMount).toBe(false);
    });

    it('keeps the initial focus target stable while the selected year changes during the same open cycle', () => {
        const {rerender} = renderYearPicker(2018);

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        expect(initialProps?.data.at(0)?.value).toBe(2018);
        expect(initialProps?.initiallyFocusedItemKey).toBe('2018');

        rerender(
            <YearPickerModal
                isVisible
                years={buildYears(2020)}
                currentYear={2020}
                onYearChange={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps?.data.at(0)?.value).toBe(2018);
        expect(updatedProps?.initiallyFocusedItemKey).toBe('2018');
        expect(updatedProps?.data.find((item) => item.value === 2020)?.isSelected).toBe(true);
    });

    it('refreshes the pinned year and focus target when the modal is reopened', () => {
        const {unmount} = renderYearPicker(2018);
        unmount();
        mockedSelectionList.mockClear();

        renderYearPicker(2020);

        const reopenedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(reopenedProps?.data.at(0)?.value).toBe(2020);
        expect(reopenedProps?.initiallyFocusedItemKey).toBe('2020');
    });

    it('keeps natural filtered ordering while search is active', () => {
        renderYearPicker(2018);

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('201');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(searchedProps?.data.at(0)?.value).toBe(2019);
        expect(searchedProps?.data.findIndex((item) => item.value === 2018)).toBeGreaterThan(0);
    });
});
