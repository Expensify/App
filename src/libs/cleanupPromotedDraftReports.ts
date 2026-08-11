import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection, OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Startup cleanup for speculative report rows left by interrupted draft promotions. */
function getPromotedDraftReportCleanupData(promotions: OnyxCollection<boolean>, reportDrafts: OnyxCollection<Report>) {
    const cleanupData: Record<string, null> = {};

    for (const promotionKey of Object.keys(promotions ?? {})) {
        const reportID = promotionKey.slice(ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION.length);
        cleanupData[promotionKey] = null;

        if (reportDrafts?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`]) {
            cleanupData[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = null;
        }
    }

    return cleanupData as OnyxMultiSetInput;
}

function cleanupReportDrafts(promotions: OnyxCollection<boolean>) {
    let reportDraftsConnection: ReturnType<typeof Onyx.connectWithoutView>;

    function handleReportDrafts(reportDrafts: OnyxCollection<Report>) {
        Onyx.disconnect(reportDraftsConnection);
        Onyx.multiSet(getPromotedDraftReportCleanupData(promotions, reportDrafts));
    }

    reportDraftsConnection = Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.REPORT_DRAFT,
        callback: handleReportDrafts,
    });
}

/**
 * Clears speculative report rows left by an interrupted pre-mount promotion. This runs before React mounts because
 * an app termination does not run component cleanup. A missing draft means submission already converted the draft,
 * so only the stale promotion marker is removed and the real report is preserved.
 */
function cleanupPromotedDraftReports() {
    // This is startup-only cleanup outside React, so it cannot use useOnyx.
    let promotionsConnection: ReturnType<typeof Onyx.connectWithoutView>;

    function handlePromotions(promotions: OnyxCollection<boolean>) {
        Onyx.disconnect(promotionsConnection);
        if (!Object.keys(promotions ?? {}).length) {
            return;
        }

        cleanupReportDrafts(promotions);
    }

    promotionsConnection = Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION,
        callback: handlePromotions,
    });
}

export {getPromotedDraftReportCleanupData};
export default cleanupPromotedDraftReports;
