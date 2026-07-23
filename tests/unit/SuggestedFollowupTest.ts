import {applyPendingConciergeAction, clearPendingFollowupList, discardPendingConciergeAction} from '@libs/actions/Report/SuggestedFollowup';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID = '1';
const REPORT_ACTION_ID = '100';

const fakeConciergeAction = {
    reportActionID: REPORT_ACTION_ID,
    actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    message: [{html: 'Hello.', text: 'Hello.', type: CONST.REPORT.MESSAGE.TYPE.COMMENT}],
} as ReportAction;

describe('SuggestedFollowup actions — followup-list skeleton flag', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('applyPendingConciergeAction', () => {
        it('moves the optimistic action into REPORT_ACTIONS and atomically sets the followup-list pending flag', async () => {
            // Given a pending optimistic Concierge response queued for delayed display
            await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
                reportAction: fakeConciergeAction,
                displayAfter: Date.now() + 1000,
            });
            await waitForBatchedUpdates();

            // When applyPendingConciergeAction commits the optimistic to REPORT_ACTIONS
            const before = Date.now();
            applyPendingConciergeAction(REPORT_ID, fakeConciergeAction);
            await waitForBatchedUpdates();
            const after = Date.now();

            // Then the action is in REPORT_ACTIONS
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
            expect(reportActions?.[REPORT_ACTION_ID]?.actorAccountID).toBe(CONST.ACCOUNT_ID.CONCIERGE);

            // And the pending optimistic was cleared
            const pendingResponse = await getOnyxValue(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}` as const);
            expect(pendingResponse).toBeUndefined();

            // And the followup-list skeleton flag was atomically written for the same action
            const pendingFollowupList = await getOnyxValue(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${REPORT_ID}` as const);
            expect(pendingFollowupList?.reportActionID).toBe(REPORT_ACTION_ID);
            expect(pendingFollowupList?.createdAt).toBeGreaterThanOrEqual(before);
            expect(pendingFollowupList?.createdAt).toBeLessThanOrEqual(after);
        });
    });

    describe('discardPendingConciergeAction', () => {
        it('atomically clears both the pending optimistic and the followup-list pending flag', async () => {
            // Given a pending optimistic and a pre-existing followup-list flag (e.g., from a prior apply)
            await Onyx.merge(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}`, {
                reportAction: fakeConciergeAction,
                displayAfter: Date.now() + 1000,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${REPORT_ID}`, {
                reportActionID: REPORT_ACTION_ID,
                createdAt: Date.now(),
            });
            await waitForBatchedUpdates();

            // When discard fires (e.g., canonical landed during trickle)
            discardPendingConciergeAction(REPORT_ID);
            await waitForBatchedUpdates();

            // Then both keys are cleared together — no in-between state where the
            // skeleton could outlive its owning optimistic
            const pendingResponse = await getOnyxValue(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${REPORT_ID}` as const);
            expect(pendingResponse).toBeUndefined();

            const pendingFollowupList = await getOnyxValue(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${REPORT_ID}` as const);
            expect(pendingFollowupList).toBeUndefined();
        });
    });

    describe('clearPendingFollowupList', () => {
        it('clears the followup-list pending flag for the given report', async () => {
            // Given a followup-list flag
            await Onyx.set(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${REPORT_ID}`, {
                reportActionID: REPORT_ACTION_ID,
                createdAt: Date.now(),
            });
            await waitForBatchedUpdates();

            // When clear fires (canonical with real followup-list arrived, or TTL fired)
            clearPendingFollowupList(REPORT_ID);
            await waitForBatchedUpdates();

            // Then the flag is gone
            const pendingFollowupList = await getOnyxValue(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${REPORT_ID}` as const);
            expect(pendingFollowupList).toBeUndefined();
        });

        it('is a no-op when reportID is undefined (guards against unmounted-report races)', async () => {
            // Given an unrelated report has a flag (must not be clobbered)
            const OTHER_REPORT_ID = '2';
            await Onyx.set(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${OTHER_REPORT_ID}`, {
                reportActionID: REPORT_ACTION_ID,
                createdAt: Date.now(),
            });
            await waitForBatchedUpdates();

            // When clear is invoked with no reportID (e.g. hook ran before a reportID resolved)
            clearPendingFollowupList(undefined);
            await waitForBatchedUpdates();

            // Then the unrelated report's flag is untouched
            const pendingFollowupList = await getOnyxValue(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${OTHER_REPORT_ID}` as const);
            expect(pendingFollowupList?.reportActionID).toBe(REPORT_ACTION_ID);
        });
    });
});
