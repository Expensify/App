import {getDelegateAccountIDFromReportAction} from '@libs/ReportActionsUtils';
import type {Ancestor} from '@libs/ReportUtils';
import {buildOptimisticAddCommentReportAction, getOptimisticDataForAncestors} from '@libs/ReportUtils';

import {addComment} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/** The account the copilot is acting on behalf of. While connected as a copilot this is also the session account. */
const DELEGATOR_ACCOUNT_ID = 3;

/** The copilot taking the action. This is the account whose avatar the comment is rendered with. */
const COPILOT_ACCOUNT_ID = 5;

const PARENT_REPORT_ID = '1';
const PARENT_REPORT_ACTION_ID = '100';
const THREAD_REPORT_ID = '2';

const parentReport: Report = {reportID: PARENT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT};

const parentReportAction: ReportAction = {
    reportActionID: PARENT_REPORT_ACTION_ID,
    reportID: PARENT_REPORT_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    actorAccountID: DELEGATOR_ACCOUNT_ID,
    delegateAccountID: COPILOT_ACCOUNT_ID,
    created: '2026-08-13 00:00:00.000',
    message: [],
    originalMessage: {html: 'Parent message posted by the copilot', whisperedTo: []},
    childReportID: THREAD_REPORT_ID,
    childVisibleActionCount: 0,
};

function buildAncestors(reportAction: ReportAction): Ancestor[] {
    return [{report: parentReport, reportAction, shouldDisplayNewMarker: false}];
}

function getThreadSummary(ancestors: Ancestor[], reply: ReportAction, commenterAccountID?: number) {
    const [update] = getOptimisticDataForAncestors(ancestors, reply.created, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, commenterAccountID);
    if (update.onyxMethod !== Onyx.METHOD.MERGE) {
        throw new Error('Expected the ancestor update to be a merge');
    }
    return update.value?.[PARENT_REPORT_ACTION_ID];
}

function buildReply(delegateAccountIDParam: number | undefined) {
    return buildOptimisticAddCommentReportAction({
        text: 'Reply in the thread',
        reportID: THREAD_REPORT_ID,
        currentUserAccountID: DELEGATOR_ACCOUNT_ID,
        delegateAccountIDParam,
    }).reportAction as ReportAction;
}

describe('thread summary avatars', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: DELEGATOR_ACCOUNT_ID, email: 'accounts.payable@example.com'});
        await waitForBatchedUpdates();
    });

    it('attributes a copilot reply to the copilot, matching the avatar the reply itself renders with', () => {
        const reply = buildReply(COPILOT_ACCOUNT_ID);
        const commentAuthorAccountID = getDelegateAccountIDFromReportAction(reply) ?? reply.actorAccountID;

        const updatedParentAction = getThreadSummary(buildAncestors(parentReportAction), reply, reply.delegateAccountID ?? DELEGATOR_ACCOUNT_ID);

        expect(commentAuthorAccountID).toBe(COPILOT_ACCOUNT_ID);
        expect(updatedParentAction?.childOldestFourAccountIDs?.split(',')).toEqual([String(commentAuthorAccountID)]);
    });

    it('counts a copilot replying twice as a single commenter', () => {
        const parentWithCopilotReply: ReportAction = {
            ...parentReportAction,
            childOldestFourAccountIDs: String(COPILOT_ACCOUNT_ID),
            childCommenterCount: 1,
            childVisibleActionCount: 1,
        };
        const secondReply = buildReply(COPILOT_ACCOUNT_ID);

        const updatedParentAction = getThreadSummary(buildAncestors(parentWithCopilotReply), secondReply, COPILOT_ACCOUNT_ID);

        expect(updatedParentAction?.childOldestFourAccountIDs?.split(',')).toEqual([String(COPILOT_ACCOUNT_ID)]);
        expect(updatedParentAction?.childCommenterCount).toBe(1);
        expect(updatedParentAction?.childVisibleActionCount).toBe(2);
    });

    it('still attributes a regular reply to the signed-in account', () => {
        const reply = buildReply(undefined);

        const updatedParentAction = getThreadSummary(buildAncestors(parentReportAction), reply);

        expect(getDelegateAccountIDFromReportAction(reply)).toBeUndefined();
        expect(updatedParentAction?.childOldestFourAccountIDs?.split(',')).toEqual([String(DELEGATOR_ACCOUNT_ID)]);
        expect(updatedParentAction?.childCommenterCount).toBe(1);
    });
});

describe('addComment thread summary attribution', () => {
    const threadReport: Report = {reportID: THREAD_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, parentReportID: PARENT_REPORT_ID, parentReportActionID: PARENT_REPORT_ACTION_ID};

    beforeEach(async () => {
        global.fetch = TestHelper.createGlobalFetchMock();
        await Onyx.clear();
        await TestHelper.signInWithTestUser(DELEGATOR_ACCOUNT_ID, 'accounts.payable@example.com');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, parentReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`, threadReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {[PARENT_REPORT_ACTION_ID]: parentReportAction});
        await waitForBatchedUpdates();
    });

    async function readActions(reportID: string): Promise<OnyxEntry<ReportActions>> {
        return new Promise((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });
    }

    it('writes the copilot into the parent summary when the reply is posted on behalf of someone else', async () => {
        addComment({
            report: threadReport,
            notifyReportID: THREAD_REPORT_ID,
            ancestors: buildAncestors(parentReportAction),
            text: 'Reply in the thread',
            timezoneParam: CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID: DELEGATOR_ACCOUNT_ID,
            delegateAccountID: COPILOT_ACCOUNT_ID,
            conciergeReportID: undefined,
            shouldPlaySound: false,
        });
        await waitForBatchedUpdates();

        const reply = Object.values((await readActions(THREAD_REPORT_ID)) ?? {}).find((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);
        const updatedParentAction = (await readActions(PARENT_REPORT_ID))?.[PARENT_REPORT_ACTION_ID];

        expect(getDelegateAccountIDFromReportAction(reply)).toBe(COPILOT_ACCOUNT_ID);
        expect(updatedParentAction?.childOldestFourAccountIDs).toBe(String(COPILOT_ACCOUNT_ID));
        expect(updatedParentAction?.childCommenterCount).toBe(1);
    });

    it('writes the signed-in account into the parent summary for a regular reply', async () => {
        addComment({
            report: threadReport,
            notifyReportID: THREAD_REPORT_ID,
            ancestors: buildAncestors(parentReportAction),
            text: 'Reply in the thread',
            timezoneParam: CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID: DELEGATOR_ACCOUNT_ID,
            delegateAccountID: undefined,
            conciergeReportID: undefined,
            shouldPlaySound: false,
        });
        await waitForBatchedUpdates();

        const updatedParentAction = (await readActions(PARENT_REPORT_ID))?.[PARENT_REPORT_ACTION_ID];

        expect(updatedParentAction?.childOldestFourAccountIDs).toBe(String(DELEGATOR_ACCOUNT_ID));
    });
});
