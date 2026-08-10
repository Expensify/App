import {render} from '@testing-library/react-native';

import ReportActionsListItemRenderer from '@pages/inbox/report/ReportActionsListItemRenderer';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';

const mockReportActionItem = jest.fn<null, [unknown]>(() => null);
const mockSystemReportActionItem = jest.fn<null, [unknown]>(() => null);

function MockSystemReportActionItem(props: Record<string, unknown>) {
    return mockSystemReportActionItem(props);
}

jest.mock('@pages/inbox/report/ReportActionItem', () => ({
    __esModule: true,
    default: (props: unknown) => mockReportActionItem(props),
}));
jest.mock('@pages/inbox/report/ReportActionItemParentAction', () => jest.fn(() => null));

const action: ReportAction = {
    reportActionID: '1',
    actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
    actorAccountID: 1,
    created: '2026-07-30 00:00:00.000',
    message: [{type: 'TEXT', html: 'modified', text: 'modified'}],
};
const report: Report = {reportID: 'report-1'};

function renderItem(reportActionItemComponent?: typeof MockSystemReportActionItem) {
    return render(
        <ReportActionsListItemRenderer
            reportAction={action}
            parentReportAction={undefined}
            parentReportActionForTransactionThread={undefined}
            report={report}
            transactionThreadReport={undefined}
            displayAsGroup={false}
            reportActionItemComponent={reportActionItemComponent}
            shouldHideThreadDividerLine={false}
            shouldDisplayNewMarker={false}
            shouldDisplayReplyDivider={false}
            isFirstVisibleReportAction
        />,
    );
}

describe('ReportActionsListItemRenderer system-message presentation', () => {
    beforeEach(() => {
        mockReportActionItem.mockClear();
        mockSystemReportActionItem.mockClear();
    });

    it('keeps the existing standalone rendering path unchanged by default', () => {
        renderItem();

        expect(mockReportActionItem).toHaveBeenCalledTimes(1);
        expect(mockSystemReportActionItem).not.toHaveBeenCalled();
    });

    it('uses the path without an avatar only when the money-request audit list opts in', () => {
        renderItem(MockSystemReportActionItem);

        expect(mockSystemReportActionItem).toHaveBeenCalledTimes(1);
        expect(mockReportActionItem).not.toHaveBeenCalled();
    });
});
