import {clearPromotedDraftReportForPreMount, clearPromotedDraftReportPreMountMarker, promoteDraftReportForPreMount} from '@libs/actions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('promoteDraftReportForPreMount lifecycle', () => {
    beforeEach(() => Onyx.clear());

    it('writes the promotion marker and the speculative report together', async () => {
        const reportID = '123';
        const draftReport = {reportID} as Report;

        await promoteDraftReportForPreMount(reportID, draftReport);

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBe(true);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual(draftReport);
    });

    it('clearPromotedDraftReportPreMountMarker (confirm path) clears only the marker, leaving the now-real report intact', async () => {
        const reportID = '123';
        const draftReport = {reportID} as Report;
        await promoteDraftReportForPreMount(reportID, draftReport);

        await clearPromotedDraftReportPreMountMarker(reportID);

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual(draftReport);
    });

    it('clearPromotedDraftReportForPreMount (cancel path) removes both the speculative report and the marker', async () => {
        const reportID = '123';
        const draftReport = {reportID} as Report;
        await promoteDraftReportForPreMount(reportID, draftReport);

        await clearPromotedDraftReportForPreMount(reportID);

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
    });

    it('clearPromotedDraftReportForPreMount removes the speculative report before clearing the marker, so a mid-flight crash leaves only the marker for startup cleanup to consume', async () => {
        const reportID = '123';
        const draftReport = {reportID} as Report;
        await promoteDraftReportForPreMount(reportID, draftReport);

        const setSpy = jest.spyOn(Onyx, 'set');
        await clearPromotedDraftReportForPreMount(reportID);

        const reportSetCallIndex = setSpy.mock.calls.findIndex((call) => call[0] === `${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
        const markerSetCallIndex = setSpy.mock.calls.findIndex((call) => call[0] === `${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`);
        expect(reportSetCallIndex).toBeGreaterThanOrEqual(0);
        expect(markerSetCallIndex).toBeGreaterThan(reportSetCallIndex);

        setSpy.mockRestore();
    });

    it('clearPromotedDraftReportPreMountMarker is a no-op on the report row when no promotion ever happened', async () => {
        const reportID = 'never-promoted';

        await clearPromotedDraftReportPreMountMarker(reportID);
        await waitForBatchedUpdates();

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
    });

    it('clearPromotedDraftReportForPreMount is safe when nothing was ever promoted (does not create phantom rows)', async () => {
        const reportID = 'never-promoted';

        await clearPromotedDraftReportForPreMount(reportID);

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toBeUndefined();
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBeUndefined();
    });

    it('promoting the same reportID twice overwrites the previous draft snapshot rather than merging it', async () => {
        const reportID = '123';
        await promoteDraftReportForPreMount(reportID, {reportID, reportName: 'first'} as Report);

        await promoteDraftReportForPreMount(reportID, {reportID, reportName: 'second'} as Report);

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${reportID}`)).toBe(true);
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`)).toEqual({reportID, reportName: 'second'});
    });
});
