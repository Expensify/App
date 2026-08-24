import cleanupPromotedDraftReports from '@libs/cleanupPromotedDraftReports';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('cleanupPromotedDraftReports (connectWithoutView orchestration)', () => {
    beforeEach(() => Onyx.clear());

    it('removes an interrupted promoted report and its stale marker when the draft still exists', async () => {
        // Given a promotion interrupted before its draft was submitted
        const reportID = '123';
        await Promise.all([
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`, true),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, {reportID} as Report),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID} as Report),
        ]);

        // When startup cleanup reconciles stale promotion state
        cleanupPromotedDraftReports();
        await waitForBatchedUpdates();

        // Then speculative data is removed because the draft remains authoritative
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
    });

    it('preserves a submitted report and only clears the marker when its draft no longer exists', async () => {
        // Given a promoted report whose draft disappeared after successful submission
        const reportID = '456';
        await Promise.all([Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`, true), Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID} as Report)]);

        // When startup cleanup reconciles the leftover promotion marker
        cleanupPromotedDraftReports();
        await waitForBatchedUpdates();

        // Then the real report survives because the missing draft signals completion
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual({reportID});
    });

    it('is a no-op when there are no stale promotion markers', async () => {
        // Given startup state without interrupted promotions
        const multiSetSpy = jest.spyOn(Onyx, 'multiSet');

        // When promotion cleanup runs
        cleanupPromotedDraftReports();
        await waitForBatchedUpdates();

        // Then Onyx is not rewritten because there is nothing to reconcile
        expect(multiSetSpy).not.toHaveBeenCalled();
        multiSetSpy.mockRestore();
    });

    it('handles multiple interrupted promotions independently in a single pass', async () => {
        // Given interrupted promotions with both pending-draft and submitted outcomes
        await Promise.all([
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}withDraft`, true),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}withDraft`, {reportID: 'withDraft'} as Report),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}withDraft`, {reportID: 'withDraft'} as Report),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}submitted`, true),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}submitted`, {reportID: 'submitted'} as Report),
        ]);

        // When startup cleanup reconciles the collection in one pass
        cleanupPromotedDraftReports();
        await waitForBatchedUpdates();

        // Then each report follows its own draft state instead of sharing one outcome
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}withDraft`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}withDraft`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}submitted`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}submitted`)).toEqual({reportID: 'submitted'});
    });
});
