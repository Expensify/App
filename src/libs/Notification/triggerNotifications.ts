import type {OnyxCollection} from 'react-native-onyx';
import {showReportActionNotification} from '@libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {OnyxServerUpdate} from '@src/types/onyx/OnyxUpdatesFromServer';

export default function triggerNotifications(onyxUpdates: OnyxServerUpdate[]): void {
    for (const update of onyxUpdates) {
        if (!update.shouldNotify && !update.shouldShowPushNotification) {
            continue;
        }

        const reportID = update.key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
        const reportActions = Object.values((update.value as OnyxCollection<ReportAction>) ?? {});

        for (const action of reportActions) {
            if (action) {
                showReportActionNotification(reportID, action);
            }
        }
    }
}
