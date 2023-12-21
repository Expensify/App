import Onyx, {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import * as OnyxTypes from '@src/types/onyx';

function getReportActionsFromOnyxClean(): Promise<OnyxCollection<OnyxTypes.ReportActions>> {
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
        const onyxData: OnyxCollection<OnyxTypes.ReportActions> = {};

        Object.keys(allReportActions ?? {}).forEach((onyxKey) => {
            onyxData[onyxKey] = {};
        });

        return Onyx.multiSet(onyxData as Record<`${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}`, Record<string, never>>);
    });
}
