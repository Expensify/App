import {act, render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import SelectionList from '@components/SelectionList';
import TimezoneSelectPage from '@pages/settings/Profile/TimezoneSelectPage';
import TIMEZONES from '@src/TIMEZONES';

const selectableTimezones = TIMEZONES.filter((tz) => !tz.startsWith('Etc/GMT'));
// A timezone near the end of the alphabetical list, so its natural position is far down.
const selectedTimezone = 'Pacific/Wake';

let mockTimezone: {selected: string; automatic: boolean} = {selected: selectedTimezone, automatic: false};

jest.mock('@hooks/useCurrentUserPersonalDetails', () =>
    jest.fn(() => ({
        accountID: 1,
        timezone: mockTimezone,
    })),
);
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));

describe('TimezoneSelectPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockTimezone = {selected: selectedTimezone, automatic: false};
        mockedSelectionList.mockClear();
        mockedSelectionList.mockImplementation(() => <View />);
    });

    it('pins the selected timezone to the top of the list when the page opens', () => {
        render(<TimezoneSelectPage />);

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                text: selectedTimezone,
                value: selectedTimezone,
                isSelected: true,
            }),
        );
        // The focused item resolves to the pinned row, so there is no scroll-to-selected on open.
        expect(selectionListProps?.initiallyFocusedItemKey).toBe(selectionListProps?.data.at(0)?.keyForList);
    });

    it('keeps the selected timezone pinned to the top while filtering with a matching search', () => {
        render(<TimezoneSelectPage />);

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('Pacific');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(searchedProps?.data.at(0)).toEqual(
            expect.objectContaining({
                text: selectedTimezone,
                isSelected: true,
            }),
        );
        expect(searchedProps?.data.every((tz) => tz.text.toLowerCase().includes('pacific'))).toBe(true);
    });

    it('does not reorder when no timezone is selected', () => {
        mockTimezone = {selected: '', automatic: false};
        render(<TimezoneSelectPage />);

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.map((tz) => tz.text)).toEqual(selectableTimezones);
    });
});
