import {clearPromotedDraftReportForPreMount, clearPromotedDraftReportPreMountMarker, promoteDraftReportForPreMount} from '@libs/actions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('promoteDraftReportForPreMount lifecycle', () => {
    beforeEach(() => Onyx.clear());

    it('writes the promotion marker and the speculative report together', async () => {
        // Given a draft selected as a pre-mount destination
        const reportID = '123';
        const draftReport = {reportID} as Report;

        // When the draft is promoted for speculative rendering
        await promoteDraftReportForPreMount(reportID, draftReport);

        // Then the report and recovery marker coexist so startup can detect interruption
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBe(true);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual(draftReport);
    });

    it('clearPromotedDraftReportPreMountMarker (confirm path) clears only the marker, leaving the now-real report intact', async () => {
        // Given a promoted draft that completed submission successfully
        const reportID = '123';
        const draftReport = {reportID} as Report;
        await promoteDraftReportForPreMount(reportID, draftReport);

        // When the confirmed promotion is finalized
        await clearPromotedDraftReportPreMountMarker(reportID);

        // Then only recovery state is cleared because the report is now real
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual(draftReport);
    });

    it('clearPromotedDraftReportForPreMount (cancel path) removes both the speculative report and the marker', async () => {
        // Given a promoted draft whose submission is canceled
        const reportID = '123';
        const draftReport = {reportID} as Report;
        await promoteDraftReportForPreMount(reportID, draftReport);

        // When the speculative promotion is rolled back
        await clearPromotedDraftReportForPreMount(reportID);

        // Then neither temporary record remains because no real report was created
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
    });

    it('clearPromotedDraftReportPreMountMarker is a no-op on the report row when no promotion ever happened', async () => {
        // Given a report ID without any promotion lifecycle state
        const reportID = 'never-promoted';

        // When confirmation cleanup is called defensively
        await clearPromotedDraftReportPreMountMarker(reportID);
        await waitForBatchedUpdates();

        // Then no report row appears because marker cleanup must not create data
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
    });

    it('clearPromotedDraftReportForPreMount is safe when nothing was ever promoted (does not create phantom rows)', async () => {
        // Given a report ID without speculative promotion data
        const reportID = 'never-promoted';

        // When cancellation cleanup is called defensively
        await clearPromotedDraftReportForPreMount(reportID);

        // Then no phantom state is introduced because there is nothing to roll back
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
    });

    it('promoting the same reportID twice overwrites the previous draft snapshot rather than merging it', async () => {
        // Given a report ID whose draft snapshot changes before submission
        const reportID = '123';
        await promoteDraftReportForPreMount(reportID, {reportID, reportName: 'first'} as Report);

        // When the same destination is promoted again with the latest snapshot
        await promoteDraftReportForPreMount(reportID, {reportID, reportName: 'second'} as Report);

        // Then stale fields are replaced so speculative rendering matches the latest draft
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBe(true);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual({reportID, reportName: 'second'});
    });
});
