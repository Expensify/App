import * as ReportActions from '@libs/actions/Report';
import {applyPendingConciergeAction, clearPendingFollowupList, discardPendingConciergeAction, resolveSuggestedFollowup} from '@libs/actions/Report/SuggestedFollowup';
import type {Followup} from '@libs/ReportActionFollowupUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type {Timezone} from '@src/types/onyx/PersonalDetails';

import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
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

    describe('resolveSuggestedFollowup — conciergeReportID threading', () => {
        const CONCIERGE_REPORT_ID = 'concierge-report-id-42';
        const CURRENT_USER_ACCOUNT_ID = 5;
        const CURRENT_USER_EMAIL = 'user@example.com';
        const timezone = CONST.DEFAULT_TIME_ZONE as Timezone;

        // A report action carrying an unresolved <followup-list>, so buildOptimisticResolvedFollowups
        // returns a truthy value and resolveSuggestedFollowup proceeds to call addComment.
        const followupReport: Report = {
            ...createRandomReport(1, undefined),
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
        };
        const followupListReportAction: ReportAction = {
            ...createRandomReportAction(1),
            reportActionID: REPORT_ACTION_ID,
            actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            message: [
                {
                    html: '<followup-list><followup><followup-text>Why was this flagged?</followup-text></followup></followup-list>',
                    text: 'Why was this flagged?',
                    type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                },
            ],
        };

        it('forwards the real conciergeReportID to addComment instead of falling back to the deprecated Onyx.connect value', async () => {
            // Given addComment is stubbed so we can inspect the params it receives
            const addCommentSpy = jest.spyOn(ReportActions, 'addComment').mockImplementation(() => {});
            // And a followup with no pre-generated response (the plain-comment path)
            const selectedFollowup: Followup = {text: 'Why was this flagged?'};

            // When the followup is resolved with a concrete conciergeReportID
            resolveSuggestedFollowup(
                followupReport,
                undefined,
                followupListReportAction,
                selectedFollowup,
                timezone,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                CONCIERGE_REPORT_ID,
            );
            await waitForBatchedUpdates();

            // Then that exact conciergeReportID is threaded through to addComment (not undefined)
            expect(addCommentSpy).toHaveBeenCalledTimes(1);
            expect(addCommentSpy).toHaveBeenCalledWith(expect.objectContaining({conciergeReportID: CONCIERGE_REPORT_ID}));

            addCommentSpy.mockRestore();
        });

        it('forwards the conciergeReportID on the pre-generated-response path as well', async () => {
            // Given addComment is stubbed and a followup that carries a pre-generated Concierge response
            const addCommentSpy = jest.spyOn(ReportActions, 'addComment').mockImplementation(() => {});
            const selectedFollowup: Followup = {
                text: 'Why was this flagged?',
                response: 'Because it was a duplicate.',
            };

            // When the followup is resolved
            resolveSuggestedFollowup(
                followupReport,
                undefined,
                followupListReportAction,
                selectedFollowup,
                timezone,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                undefined,
                CONCIERGE_REPORT_ID,
            );
            await waitForBatchedUpdates();

            // Then the user's immediately-posted comment still carries the real conciergeReportID
            expect(addCommentSpy).toHaveBeenCalledWith(expect.objectContaining({conciergeReportID: CONCIERGE_REPORT_ID}));

            addCommentSpy.mockRestore();
        });
    });
});
