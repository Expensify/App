import {render, screen} from '@testing-library/react-native';
import React from 'react';
import ReportActionsListHeader from '@pages/inbox/report/ReportActionsListHeader';

const REPORT_ID = '42';

const mockUseOnyx = jest.fn<unknown[], [string]>();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

jest.mock('@pages/home/report/ConciergeThinkingMessage', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        __esModule: true,
        default: () => <MockView testID="ConciergeThinkingMessage" />,
    };
});

jest.mock('@pages/inbox/report/ListBoundaryLoader', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        __esModule: true,
        default: () => <MockView testID="ListBoundaryLoader" />,
    };
});

describe('ReportActionsListHeader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockImplementation((key: string) => {
            if (key.startsWith('report_')) {
                return [{reportID: REPORT_ID}];
            }
            return [undefined];
        });
    });

    it('renders ListBoundaryLoader', () => {
        render(
            <ReportActionsListHeader
                reportID={REPORT_ID}
                onRetry={jest.fn()}
            />,
        );
        expect(screen.getByTestId('ListBoundaryLoader')).toBeTruthy();
    });

    it('renders ConciergeThinkingMessage and delegates visibility gating to that component', () => {
        render(
            <ReportActionsListHeader
                reportID={REPORT_ID}
                onRetry={jest.fn()}
            />,
        );
        expect(screen.getByTestId('ConciergeThinkingMessage')).toBeTruthy();
    });
});
