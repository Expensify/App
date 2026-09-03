import {clearPreMountedDraftReport, clearPreMountedDraftReportMarker, preMountDraftReport} from '@libs/actions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('preMountDraftReport lifecycle', () => {
    beforeEach(() => Onyx.clear());

    it('writes the pre-mount marker and the speculative report together', async () => {
        // Given a draft selected as a pre-mount destination
        const reportID = '123';
        const draftReport = {reportID} as Report;

        // When the draft is pre-mounted for speculative rendering
        await preMountDraftReport(reportID, draftReport);

        // Then the report and recovery marker coexist so startup can detect interruption
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`)).toBe(true);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual(draftReport);
    });

    it('clearPreMountedDraftReportMarker (confirm path) clears only the marker, leaving the now-real report intact', async () => {
        // Given a pre-mounted draft that completed submission successfully
        const reportID = '123';
        const draftReport = {reportID} as Report;
        await preMountDraftReport(reportID, draftReport);

        // When the confirmed pre-mount is finalized
        await clearPreMountedDraftReportMarker(reportID);

        // Then only recovery state is cleared because the report is now real
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual(draftReport);
    });

    it('clearPreMountedDraftReport (cancel path) removes both the speculative report and the marker', async () => {
        // Given a pre-mounted draft whose submission is canceled
        const reportID = '123';
        const draftReport = {reportID} as Report;
        await preMountDraftReport(reportID, draftReport);

        // When the speculative pre-mount is rolled back
        await clearPreMountedDraftReport(reportID);

        // Then neither temporary record remains because no real report was created
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
    });

    it('clearPreMountedDraftReportMarker is a no-op on the report row when no pre-mount ever happened', async () => {
        // Given a report ID without any pre-mount lifecycle state
        const reportID = 'never-pre-mounted';

        // When confirmation cleanup is called defensively
        await clearPreMountedDraftReportMarker(reportID);
        await waitForBatchedUpdates();

        // Then no report row appears because marker cleanup must not create data
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`)).toBeUndefined();
    });

    it('clearPreMountedDraftReport is safe when nothing was ever pre-mounted (does not create phantom rows)', async () => {
        // Given a report ID without speculative pre-mount data
        const reportID = 'never-pre-mounted';

        // When cancellation cleanup is called defensively
        await clearPreMountedDraftReport(reportID);

        // Then no phantom state is introduced because there is nothing to roll back
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`)).toBeUndefined();
    });

    it('pre-mounting the same reportID twice overwrites the previous draft snapshot rather than merging it', async () => {
        // Given a report ID whose draft snapshot changes before submission
        const reportID = '123';
        await preMountDraftReport(reportID, {reportID, reportName: 'first'} as Report);

        // When the same destination is pre-mounted again with the latest snapshot
        await preMountDraftReport(reportID, {reportID, reportName: 'second'} as Report);

        // Then stale fields are replaced so speculative rendering matches the latest draft
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`)).toBe(true);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual({reportID, reportName: 'second'});
    });
});
