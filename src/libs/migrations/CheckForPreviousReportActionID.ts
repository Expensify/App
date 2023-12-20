import Onyx, {OnyxCollection} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import * as OnyxTypes from '@src/types/onyx';

function getReportActionsFromOnyx(): Promise<OnyxCollection<OnyxTypes.ReportActions>> {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            waitForCollectionCallback: true,
            callback: (allReportActions) => {
                Onyx.disconnect(connectionID);
                return resolve(allReportActions);
            },
        });
    });
}

/**
 * This migration checks for the 'previousReportActionID' key in the first valid reportAction of a report in Onyx.
 * If the key is not found then all reportActions for all reports are removed from Onyx.
 */
export default function (): Promise<void> {
    return getReportActionsFromOnyx().then((allReportActions) => {
        if (Object.keys(allReportActions ?? {}).length === 0) {
            Log.info(`[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no reportActions`);
            return;
        }

        let firstValidValue: OnyxTypes.ReportAction | undefined;

        Object.values(allReportActions ?? {}).some((reportActions) =>
            Object.values(reportActions ?? {}).some((reportActionData) => {
                if ('reportActionID' in reportActionData) {
                    firstValidValue = reportActionData;
                    return true;
                }

                return false;
            }),
        );

        if (!firstValidValue) {
            Log.info(`[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no valid reportActions`);
            return;
        }

        if (firstValidValue.previousReportActionID) {
            Log.info(`[Migrate Onyx] CheckForPreviousReportActionID Migration: previousReportActionID found. Migration complete`);
            return;
        }

        // If previousReportActionID not found:
        Log.info(`[Migrate Onyx] CheckForPreviousReportActionID Migration: removing all reportActions because previousReportActionID not found in the first valid reportAction`);

        const onyxData: OnyxCollection<OnyxTypes.ReportActions> = {};

        Object.keys(allReportActions ?? {}).forEach((onyxKey) => {
            onyxData[onyxKey] = {};
        });

        return Onyx.multiSet(onyxData as Record<`${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}`, Record<string, never>>);
    });
}
