import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection, OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Startup cleanup for speculative report rows left by interrupted draft pre-mounts. */
function getPreMountedDraftReportCleanupData(markers: OnyxCollection<boolean>, reportDrafts: OnyxCollection<Report>): OnyxMultiSetInput {
    const cleanupData: OnyxMultiSetInput = {};

    for (const key of Object.keys(markers ?? {})) {
        const reportID = key.slice(ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT.length);
        const markerKey: `${typeof ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${string}` = `${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${reportID}`;
        cleanupData[markerKey] = null;

        if (reportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`]) {
            const reportKey: `${typeof ONYXKEYS.COLLECTION.REPORT}${string}` = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            cleanupData[reportKey] = null;
        }
    }

    return cleanupData;
}

/**
 * Reads the draft reports once to decide which speculative rows are safe to delete. Runs before React mounts,
 * outside any component, so there's no hook available - takes a single snapshot instead and disconnects
 * immediately, since nothing here renders or needs to stay subscribed.
 */
function cleanupReportDrafts(markers: OnyxCollection<boolean>) {
    let reportDraftsConnection: ReturnType<typeof Onyx.connectWithoutView>;

    function handleReportDrafts(reportDrafts: OnyxCollection<Report>) {
        Onyx.disconnect(reportDraftsConnection);
        Onyx.multiSet(getPreMountedDraftReportCleanupData(markers, reportDrafts));
    }

    reportDraftsConnection = Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.REPORT_DRAFT,
        callback: handleReportDrafts,
    });
}

/**
 * Clears speculative report rows left by an interrupted draft pre-mount. This runs before React mounts because
 * an app termination does not run component cleanup. A missing draft means submission already converted the draft,
 * so only the stale pre-mount marker is removed and the real report is preserved.
 */
function cleanupPreMountedDraftReports() {
    // Same reasoning as cleanupReportDrafts above: no hook available yet, so take a single snapshot
    // and disconnect immediately.
    let markersConnection: ReturnType<typeof Onyx.connectWithoutView>;

    function handleMarkers(markers: OnyxCollection<boolean>) {
        Onyx.disconnect(markersConnection);
        if (!Object.keys(markers ?? {}).length) {
            return;
        }

        cleanupReportDrafts(markers);
    }

    markersConnection = Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT,
        callback: handleMarkers,
    });
}

export {getPreMountedDraftReportCleanupData};
export default cleanupPreMountedDraftReports;
