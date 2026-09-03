import cleanupPreMountedDraftReports from '@libs/cleanupPreMountedDraftReports';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('cleanupPreMountedDraftReports (connectWithoutView orchestration)', () => {
    beforeEach(() => Onyx.clear());

    it('removes an interrupted pre-mounted report and its stale marker when the draft still exists', async () => {
        // Given a pre-mount interrupted before its draft was submitted
        const reportID = '123';
        await Promise.all([
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`, true),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, {reportID} as Report),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID} as Report),
        ]);

        // When startup cleanup reconciles stale pre-mount state
        cleanupPreMountedDraftReports();
        await waitForBatchedUpdates();

        // Then speculative data is removed because the draft remains authoritative
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
    });

    it('preserves a submitted report and only clears the marker when its draft no longer exists', async () => {
        // Given a pre-mounted report whose draft disappeared after successful submission
        const reportID = '456';
        await Promise.all([Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`, true), Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID} as Report)]);

        // When startup cleanup reconciles the leftover pre-mount marker
        cleanupPreMountedDraftReports();
        await waitForBatchedUpdates();

        // Then the real report survives because the missing draft signals completion
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual({reportID});
    });

    it('is a no-op when there are no stale pre-mount markers', async () => {
        // Given startup state without interrupted markers
        const multiSetSpy = jest.spyOn(Onyx, 'multiSet');

        // When pre-mount cleanup runs
        cleanupPreMountedDraftReports();
        await waitForBatchedUpdates();

        // Then Onyx is not rewritten because there is nothing to reconcile
        expect(multiSetSpy).not.toHaveBeenCalled();
        multiSetSpy.mockRestore();
    });

    it('handles multiple interrupted markers independently in a single pass', async () => {
        // Given interrupted markers with both pending-draft and submitted outcomes
        await Promise.all([
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}withDraft`, true),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}withDraft`, {reportID: 'withDraft'} as Report),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}withDraft`, {reportID: 'withDraft'} as Report),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}submitted`, true),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}submitted`, {reportID: 'submitted'} as Report),
        ]);

        // When startup cleanup reconciles the collection in one pass
        cleanupPreMountedDraftReports();
        await waitForBatchedUpdates();

        // Then each report follows its own draft state instead of sharing one outcome
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}withDraft`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}withDraft`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}submitted`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}submitted`)).toEqual({reportID: 'submitted'});
    });
});
