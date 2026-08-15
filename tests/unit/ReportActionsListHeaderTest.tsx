import {render, screen} from '@testing-library/react-native';

import ReportActionsListHeader from '@pages/inbox/report/ReportActionsListHeader';

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

describe('ReportActionsListHeader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders ConciergeThinkingMessage when no draft is pending completion', () => {
        render(<ReportActionsListHeader reportID={REPORT_ID} />);
        expect(screen.getByTestId('ConciergeThinkingMessage')).toBeTruthy();
    });

    it('renders nothing while a draft is still streaming in (pending completion)', () => {
        render(
            <ReportActionsListHeader
                reportID={REPORT_ID}
                isDraftPendingCompletion
            />,
        );
        expect(screen.queryByTestId('ConciergeThinkingMessage')).toBeNull();
    });
});
