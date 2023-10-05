import Onyx, {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';
import {ReportAction} from "../../types/onyx";

function getReportActionsFromOnyx(): Promise<OnyxCollection<ReportAction>> {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            waitForCollectionCallback: true,
            callback: (allReportActions: OnyxCollection<ReportAction>) => {
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
        if (!Array.isArray(allReportActions) || allReportActions.length === 0) {
            Log.info(`[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no reportActions`);
            return;
        }

        let firstValidValue: undefined | ReportAction;

        Object.values(allReportActions as ReportAction[]).some((reportAction) => {
            if (reportAction.reportActionID !== undefined) {
                firstValidValue = reportAction;
                return true;
            }

            return false;
        });

        if (firstValidValue === undefined) {
            Log.info(`[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no valid reportActions`);
            return;
        }

        if (Object.hasOwn(firstValidValue, 'previousReportActionID')) {
            Log.info(`[Migrate Onyx] CheckForPreviousReportActionID Migration: previousReportActionID found. Migration complete`);
            return;
        }

        // If previousReportActionID not found:
        Log.info(`[Migrate Onyx] CheckForPreviousReportActionID Migration: removing all reportActions because previousReportActionID not found in the first valid reportAction`);

        const onyxData: Record<string, Partial<OnyxEntry<ReportAction>>> = {};

        Object.entries(allReportActions).forEach(([onyxKey]) => {
            onyxData[onyxKey] = {};
        });

        return Onyx.multiSet(onyxData);
    });
}
