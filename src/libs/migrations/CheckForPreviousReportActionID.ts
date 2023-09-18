import Onyx, {OnyxCollection} from 'react-native-onyx';
import _ from "lodash";
import lodashHas from "lodash/has";
import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';
import {ReportAction} from "../../types/onyx";

/**
 * @returns
 */
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
 *
 * @returns
 */
export default function (): Promise<void> {
    return getReportActionsFromOnyx().then((allReportActions) => {
        if (_.isEmpty(allReportActions)) {
            Log.info(`[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no reportActions`);
            return;
        }

        let firstValidValue;

        const records = allReportActions as Record<string, ReportAction>;

        Object.values(records).some((reportAction: ReportAction) => {
            Object.values(reportAction).some((reportActionData: unknown) => {
                if (lodashHas(reportActionData, 'reportActionID')) {
                    firstValidValue = reportActionData;
                    return true;
                }

                return false;
            });

            return true;
        });

        if (firstValidValue === undefined) {
            Log.info(`[Migrate Onyx] Skipped migration CheckForPreviousReportActionID because there were no valid reportActions`);
            return;
        }

        if (_.has(firstValidValue, 'previousReportActionID')) {
            Log.info(`[Migrate Onyx] CheckForPreviousReportActionID Migration: previousReportActionID found. Migration complete`);
            return;
        }

        // If previousReportActionID not found:
        Log.info(`[Migrate Onyx] CheckForPreviousReportActionID Migration: removing all reportActions because previousReportActionID not found in the first valid reportAction`);

        const onyxData: Record<string, ReportAction> = {};

        Object.entries(records).forEach(([onyxKey]) => {
            onyxData[onyxKey] = {} as ReportAction;
        });

        return Onyx.multiSet(onyxData as never);
    });
}
