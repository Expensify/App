import React from 'react';
import {render} from '@testing-library/react-native';
import DateCell from '../DateCell';

describe('DateCell', () => {
    it('renders formatted date when no displayText is provided', () => {
        const {getByText} = render(
            <DateCell
                date="2024-01-15"
                showTooltip={false}
                isLargeScreenWidth
            />,
        );
        expect(getByText('Jan 15, 2024')).toBeTruthy();
    });

    it('renders displayText when provided', () => {
        const {getByText} = render(
            <DateCell
                date="2024-01-15"
                showTooltip={false}
                isLargeScreenWidth
                displayText="Scanning"
            />,
        );
        expect(getByText('Scanning')).toBeTruthy();
    });

    it('renders formatted date with suffix when no displayText is provided', () => {
        const {getByText} = render(
            <DateCell
                date="2024-01-15"
                showTooltip={false}
                isLargeScreenWidth
                suffixText="Cash"
            />,
        );
        expect(getByText('Jan 15, 2024 • Cash')).toBeTruthy();
    });

    it('renders displayText even when suffixText is provided', () => {
        const {getByText} = render(
            <DateCell
                date="2024-01-15"
                showTooltip={false}
                isLargeScreenWidth
                suffixText="Cash"
                displayText="Scanning"
            />,
        );
        expect(getByText('Scanning')).toBeTruthy();
    });
});
