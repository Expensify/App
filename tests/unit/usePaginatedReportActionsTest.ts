import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';
import {getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1';
const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_USER_ACCOUNT_ID = 2;

const CREATED_ACTION = getFakeReportAction(OTHER_USER_ACCOUNT_ID, {
    reportActionID: 'created',
    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
    created: '2023-01-01 09:00:00.000',
});
const MESSAGE_1 = getFakeReportAction(OTHER_USER_ACCOUNT_ID, {
    reportActionID: 'm1',
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    created: '2023-01-01 10:00:00.000',
});
const MESSAGE_2 = getFakeReportAction(OTHER_USER_ACCOUNT_ID, {
    reportActionID: 'm2',
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    created: '2023-01-01 10:01:00.000',
});
const MESSAGE_3 = getFakeReportAction(OTHER_USER_ACCOUNT_ID, {
    reportActionID: 'm3',
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    created: '2023-01-01 10:02:00.000',
});

const REPORT_ACTIONS: ReportActions = {
    [CREATED_ACTION.reportActionID]: CREATED_ACTION,
    [MESSAGE_1.reportActionID]: MESSAGE_1,
    [MESSAGE_2.reportActionID]: MESSAGE_2,
    [MESSAGE_3.reportActionID]: MESSAGE_3,
};

function setUpOnyx(lastReadTime: string) {
    const report: Report = {
        reportID: REPORT_ID,
        reportName: 'Test Report',
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        lastReadTime,
        lastVisibleActionCreated: MESSAGE_3.created,
    } as Report;

    return Promise.all([Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report), Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, REPORT_ACTIONS)]);
}

function renderPaginatedReportActions() {
    return renderHook(() => usePaginatedReportActions(REPORT_ID, undefined, {shouldLinkToOldestUnreadReportAction: true}), {wrapper: OnyxListItemProvider});
}

describe('usePaginatedReportActions oldestUnreadReportAction', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ACCOUNT_ID, email: 'current@test.com'},
            },
        });
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('anchors to the oldest received message for a brand-new conversation (empty lastReadTime)', async () => {
        await setUpOnyx('');
        await waitForBatchedUpdatesWithAct();

        const {result} = renderPaginatedReportActions();
        await waitForBatchedUpdatesWithAct();

        expect(result.current.oldestUnreadReportAction?.reportActionID).toBe(MESSAGE_1.reportActionID);
    });

    it('anchors to the oldest unread message for an existing partially-read conversation', async () => {
        await setUpOnyx('2023-01-01 10:00:30.000');
        await waitForBatchedUpdatesWithAct();

        const {result} = renderPaginatedReportActions();
        await waitForBatchedUpdatesWithAct();

        expect(result.current.oldestUnreadReportAction?.reportActionID).toBe(MESSAGE_2.reportActionID);
    });

    it('produces no anchor for a fully-read conversation', async () => {
        await setUpOnyx('2023-01-01 23:00:00.000');
        await waitForBatchedUpdatesWithAct();

        const {result} = renderPaginatedReportActions();
        await waitForBatchedUpdatesWithAct();

        expect(result.current.oldestUnreadReportAction).toBeUndefined();
    });
});
