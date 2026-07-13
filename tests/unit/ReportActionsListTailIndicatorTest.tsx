import {render, screen} from '@testing-library/react-native';

import ReportActionsListTailIndicator from '@pages/inbox/report/ReportActionsListTailIndicator';

import React from 'react';

const REPORT_ID = '42';

jest.mock('@pages/home/report/ConciergeThinkingMessage', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View: MockView} = require('react-native');
    return {
        __esModule: true,
        default: () => <MockView testID="ConciergeThinkingMessage" />,
    };
});

describe('ReportActionsListTailIndicator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders ConciergeThinkingMessage when there is no active draft', () => {
        render(<ReportActionsListTailIndicator reportID={REPORT_ID} />);
        expect(screen.getByTestId('ConciergeThinkingMessage')).toBeTruthy();
    });

    it('renders nothing when there is an active draft', () => {
        render(
            <ReportActionsListTailIndicator
                reportID={REPORT_ID}
                hasActiveDraft
            />,
        );
        expect(screen.queryByTestId('ConciergeThinkingMessage')).toBeNull();
    });
});
