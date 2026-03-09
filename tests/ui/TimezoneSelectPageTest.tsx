import type * as ReactNavigation from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import React from 'react';
import SelectionList from '@components/SelectionList';
import {TimezoneSelectPage} from '@pages/settings/Profile/TimezoneSelectPage';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

type CurrentUserPersonalDetails = React.ComponentProps<typeof TimezoneSelectPage>['currentUserPersonalDetails'];

function buildCurrentUserPersonalDetails(selectedTimezone: string): CurrentUserPersonalDetails {
    return {
        accountID: 1,
        timezone: {
            selected: selectedTimezone,
            automatic: false,
        },
    } as CurrentUserPersonalDetails;
}

describe('TimezoneSelectPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('should keep the initial focus target stable while the selected timezone changes during the same mount', () => {
        const initialTimezone = 'Africa/Abidjan';
        const updatedTimezone = 'America/Los_Angeles';

        const {rerender} = render(<TimezoneSelectPage currentUserPersonalDetails={buildCurrentUserPersonalDetails(initialTimezone)} />);

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        expect(initialProps).toBeDefined();
        expect(initialProps?.data.at(0)?.text).toBe(initialTimezone);
        expect(initialProps?.initiallyFocusedItemKey).toBe(initialProps?.data.find((item) => item.text === initialTimezone)?.keyForList);

        rerender(<TimezoneSelectPage currentUserPersonalDetails={buildCurrentUserPersonalDetails(updatedTimezone)} />);

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps).toBeDefined();
        expect(updatedProps?.data.at(0)?.text).toBe(initialTimezone);
        expect(updatedProps?.initiallyFocusedItemKey).toBe(initialProps?.initiallyFocusedItemKey);
        expect(updatedProps?.data.find((item) => item.text === updatedTimezone)?.isSelected).toBe(true);
    });

    it('should refresh the initial focus target when the page is reopened', () => {
        const initialTimezone = 'Africa/Abidjan';
        const updatedTimezone = 'America/Los_Angeles';

        const {unmount} = render(<TimezoneSelectPage currentUserPersonalDetails={buildCurrentUserPersonalDetails(initialTimezone)} />);
        unmount();
        mockedSelectionList.mockClear();

        render(<TimezoneSelectPage currentUserPersonalDetails={buildCurrentUserPersonalDetails(updatedTimezone)} />);

        const reopenedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(reopenedProps).toBeDefined();
        expect(reopenedProps?.data.at(0)?.text).toBe(updatedTimezone);
        expect(reopenedProps?.initiallyFocusedItemKey).toBe(reopenedProps?.data.find((item) => item.text === updatedTimezone)?.keyForList);
    });
});
