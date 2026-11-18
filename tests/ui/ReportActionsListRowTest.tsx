import {render} from '@testing-library/react-native';

import ReportActionsListRow from '@pages/inbox/report/ReportActionsList/ReportActionsListRow';
import type ReportActionsListItemRenderer from '@pages/inbox/report/ReportActionsListItemRenderer';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';

jest.mock('@pages/inbox/report/ReportActionsListItemRenderer', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/CollapsedSystemMessages', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/ShowPreviousMessagesButton', () => jest.fn(() => null));

const mockReportActionsListItemRenderer: jest.MockedFunction<typeof ReportActionsListItemRenderer> = jest.requireMock('@pages/inbox/report/ReportActionsListItemRenderer');

const report: Report = {reportID: '1', type: CONST.REPORT.TYPE.CHAT};

const buildReportAction = (reportActionID: string): ReportAction => ({
    reportActionID,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    created: '2026-01-01 00:00:00.000',
    actorAccountID: 1,
});

const expandSystemMessageRun = () => {};
const onShowPreviousMessages = () => {};

const buildRow = (index: number, reportAction: ReportAction) => (
    <ReportActionsListRow
        index={index}
        reportAction={reportAction}
        parentReportAction={undefined}
        parentReportActionForTransactionThread={undefined}
        report={report}
        transactionThreadReport={undefined}
        displayAsGroup={false}
        shouldHideThreadDividerLine={false}
        shouldDisplayNewMarker={false}
        shouldDisplayReplyDivider={false}
        isFirstVisibleReportAction={false}
        reportsParentHierarchy={undefined}
        expandSystemMessageRun={expandSystemMessageRun}
        hasPreviousMessages={false}
        showFullHistory
        onShowPreviousMessages={onShowPreviousMessages}
    />
);

describe('ReportActionsListRow', () => {
    beforeEach(() => {
        mockReportActionsListItemRenderer.mockClear();
    });

    it('should not render the row content again when only the row index changes', () => {
        // Given a mounted row
        const reportAction = buildReportAction('1');
        const {rerender} = render(buildRow(0, reportAction));
        expect(mockReportActionsListItemRenderer).toHaveBeenCalledTimes(1);

        // When a newer message shifts the row to the next index
        rerender(buildRow(1, reportAction));

        // Then the row content is reused, because sending a message must not render every visible row again
        expect(mockReportActionsListItemRenderer).toHaveBeenCalledTimes(1);
    });

    it('should render the row content again when its report action changes', () => {
        // Given a mounted row
        const {rerender} = render(buildRow(0, buildReportAction('1')));

        // When the row gets a different report action
        rerender(buildRow(0, buildReportAction('2')));

        // Then the row content renders the new action, so reuse never shows stale data
        expect(mockReportActionsListItemRenderer).toHaveBeenCalledTimes(2);
        expect(mockReportActionsListItemRenderer.mock.calls.at(-1)?.at(0)).toMatchObject({reportAction: {reportActionID: '2'}});
    });
});
