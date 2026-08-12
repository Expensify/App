import cleanupPromotedDraftReports from '@libs/cleanupPromotedDraftReports';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('cleanupPromotedDraftReports (connectWithoutView orchestration)', () => {
    beforeEach(() => Onyx.clear());

    it('removes an interrupted promoted report and its stale marker when the draft still exists', async () => {
        const reportID = '123';
        await Promise.all([
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`, true),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, {reportID} as Report),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID} as Report),
        ]);

        cleanupPromotedDraftReports();
        await waitForBatchedUpdates();

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
    });

    it('preserves a submitted report and only clears the marker when its draft no longer exists', async () => {
        const reportID = '456';
        await Promise.all([Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`, true), Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID} as Report)]);

        cleanupPromotedDraftReports();
        await waitForBatchedUpdates();

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual({reportID});
    });

    it('is a no-op when there are no stale promotion markers', async () => {
        const multiSetSpy = jest.spyOn(Onyx, 'multiSet');

        cleanupPromotedDraftReports();
        await waitForBatchedUpdates();

        expect(multiSetSpy).not.toHaveBeenCalled();
        multiSetSpy.mockRestore();
    });

    it('handles multiple interrupted promotions independently in a single pass', async () => {
        await Promise.all([
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}withDraft`, true),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}withDraft`, {reportID: 'withDraft'} as Report),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}withDraft`, {reportID: 'withDraft'} as Report),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}submitted`, true),
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}submitted`, {reportID: 'submitted'} as Report),
        ]);

        cleanupPromotedDraftReports();
        await waitForBatchedUpdates();

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}withDraft`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}withDraft`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}submitted`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}submitted`)).toEqual({reportID: 'submitted'});
    });
});
