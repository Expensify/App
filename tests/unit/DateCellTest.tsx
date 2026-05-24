import {render, screen} from '@testing-library/react-native';
import React from 'react';
import DateCell from '@components/Search/SearchList/ListItem/DateCell';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => () => ({isInNarrowPaneModal: false}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    lineHeightLarge: {},
    pre: {},
    justifyContentCenter: {},
    mutedNormalTextLabel: {},
    flexShrink1: {},
}));
jest.mock('@components/TextWithTooltip', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
    const RN = require('react-native') as typeof import('react-native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
    const ReactLocal = require('react') as typeof import('react');

    return ({text}: {text: string}) => ReactLocal.createElement(RN.Text, null, text);
});
jest.mock('@components/DatePicker/DatePickerModal', () => () => null);
jest.mock('@components/TransactionItemRow/EditableCell', () => ({
    EditableCell: ({children}: {children: React.ReactNode}) => children,
    usePopoverEditState: () => ({
        isEditing: false,
        anchorRef: {current: null},
        isPopoverVisible: false,
        popoverPosition: {},
        isInverted: false,
        startEditing: jest.fn(),
        cancelEditing: jest.fn(),
        handleSave: jest.fn(),
    }),
}));

const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);

describe('DateCell', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCurrentUserPersonalDetails.mockReturnValue({
            timezone: {selected: 'America/Los_Angeles', automatic: true},
        } as never);
    });

    it('formats UTC datetime strings using the user timezone (regression guard for Spend/Search submitted column)', () => {
        const year = new Date().getFullYear();

        // 00:30 UTC on July 1st is still the previous day in America/Los_Angeles.
        render(
            <DateCell
                date={`${year}-07-01 00:30:00`}
                showTooltip={false}
                isLargeScreenWidth
            />,
        );

        expect(screen.getByText(/Jun 30/)).toBeTruthy();
    });

    it('keeps date-only values stable by formatting them in UTC (prevents timezone shifting)', () => {
        const year = new Date().getFullYear();

        render(
            <DateCell
                date={`${year}-07-01`}
                showTooltip={false}
                isLargeScreenWidth
            />,
        );

        expect(screen.getByText(/Jul 1/)).toBeTruthy();
    });
});
