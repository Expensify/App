import {getDelegateAccountIDFromReportAction} from '@libs/ReportActionsUtils';
import type {Ancestor} from '@libs/ReportUtils';
import {buildOptimisticAddCommentReportAction, getOptimisticDataForAncestors} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

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
