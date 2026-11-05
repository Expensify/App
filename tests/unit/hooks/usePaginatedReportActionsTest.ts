import {renderHook, waitFor} from '@testing-library/react-native';

import usePaginatedReportActions from '@hooks/usePaginatedReportActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const REPORT_ID = '1';
const CREATED_ACTION: ReportAction = {
    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
    created: '2026-08-21 10:00:00.000',
    reportActionID: '1',
};
const DEW_FORWARDED_ACTION: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.FORWARDED> = {
    actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
    created: '2026-08-21 11:00:00.000',
    reportActionID: '2',
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the DEW forward is detected from the stored originalMessage
    originalMessage: {
        amount: 100,
        currency: CONST.CURRENCY.USD,
        expenseReportID: REPORT_ID,
        to: 'approver@example.com',
        workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
    },
};
const APPROVED_ACTION: ReportAction = {
    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
    created: '2026-08-21 12:00:00.000',
    reportActionID: '3',
};

describe('usePaginatedReportActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('keeps the DEW routed row when a linked page starts at its forward action', async () => {
        // Given a linked page whose newest action is a DEW forward, with a newer approval outside the page.
        // The page includes its routed row so the linked slice starts at that row, not at the forward action.
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            [CREATED_ACTION.reportActionID]: CREATED_ACTION,
            [DEW_FORWARDED_ACTION.reportActionID]: DEW_FORWARDED_ACTION,
            [APPROVED_ACTION.reportActionID]: APPROVED_ACTION,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${REPORT_ID}`, [
            [CONST.PAGINATION_START_ID, APPROVED_ACTION.reportActionID],
            [`${DEW_FORWARDED_ACTION.reportActionID}DEW`, DEW_FORWARDED_ACTION.reportActionID, CREATED_ACTION.reportActionID, CONST.PAGINATION_END_ID],
        ]);
        await waitForBatchedUpdates();

        // When the report is opened through a link to an action in that page
        const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, CREATED_ACTION.reportActionID));

        // Then the routed row still renders before its forward action, so the routed message is not lost
        await waitFor(() => {
            expect(result.current.reportActions.map((reportAction) => reportAction.reportActionID)).toEqual([
                `${DEW_FORWARDED_ACTION.reportActionID}DEW`,
                DEW_FORWARDED_ACTION.reportActionID,
                CREATED_ACTION.reportActionID,
            ]);
        });
        expect(result.current.hasNewerActions).toBe(true);
    });
});
