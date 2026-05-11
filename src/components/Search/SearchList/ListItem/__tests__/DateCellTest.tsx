import React from 'react';
import {render} from '@testing-library/react-native';
import DateCell from '../DateCell';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';

jest.mock('@libs/DateUtils', () => ({
    formatWithUTCTimeZone: jest.fn(),
    doesDateBelongToAPastYear: jest.fn(),
}));

describe('DateCell', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders formatted date when no displayText is provided', () => {
        const mockDate = '2024-01-15';
        const mockFormattedDate = 'Jan 15';
        (DateUtils.doesDateBelongToAPastYear as jest.Mock).mockReturnValue(false);
        (DateUtils.formatWithUTCTimeZone as jest.Mock).mockReturnValue(mockFormattedDate);

        const {getByText} = render(
            <DateCell
                date={mockDate}
                showTooltip={false}
                isLargeScreenWidth={true}
            />
        );

        expect(getByText(mockFormattedDate)).toBeTruthy();
        expect(DateUtils.formatWithUTCTimeZone).toHaveBeenCalledWith(mockDate, CONST.DATE.MONTH_DAY_ABBR_FORMAT);
    });

    it('renders displayText when provided (e.g., Scanning)', () => {
        const {getByText} = render(
            <DateCell
                date="2024-01-15"
                showTooltip={false}
                isLargeScreenWidth={true}
                displayText="Scanning"
            />
        );

        expect(getByText('Scanning')).toBeTruthy();
        // Should not call formatWithUTCTimeZone when displayText is provided
        expect(DateUtils.formatWithUTCTimeZone).not.toHaveBeenCalled();
    });

    it('renders suffixText when no displayText is provided', () => {
        const mockDate = '2024-01-15';
        const mockFormattedDate = 'Jan 15';
        (DateUtils.doesDateBelongToAPastYear as jest.Mock).mockReturnValue(false);
        (DateUtils.formatWithUTCTimeZone as jest.Mock).mockReturnValue(mockFormattedDate);

        const {getByText} = render(
            <DateCell
                date={mockDate}
                showTooltip={false}
                isLargeScreenWidth={true}
                suffixText="Cash"
            />
        );

        expect(getByText('Jan 15 • Cash')).toBeTruthy();
    });

    it('ignores suffixText when displayText is provided', () => {
        const {getByText} = render(
            <DateCell
                date="2024-01-15"
                showTooltip={false}
                isLargeScreenWidth={true}
                suffixText="Cash"
                displayText="Scanning"
            />
        );

        expect(getByText('Scanning')).toBeTruthy();
        expect(() => getByText('Cash')).toThrow();
    });
});
