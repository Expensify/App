import {InteractionManager} from 'react-native';
import Onyx from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import updateUnread from './updateUnread';

let previousUnreadCount = 0;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reportsFromOnyx) => {
        if (!reportsFromOnyx) {
            return;
        }

        /**
         * We need to wait until after interactions have finished to update the unread count because otherwise
         * the unread count will be updated while the interactions/animations are in progress and we don't want
         * to put more work on the main thread.
         *
         * For eg. On web we are manipulating DOM and it makes it a better candidate to wait until after interactions
         * have finished.
         *
         * More info: https://reactnative.dev/docs/interactionmanager
         */
        InteractionManager.runAfterInteractions(() => {
            const unreadReports = Object.values(reportsFromOnyx ?? {}).filter(
                (report) => ReportUtils.isUnread(report) && report?.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            );
            const unreadReportsCount = unreadReports.length;
            if (previousUnreadCount !== unreadReportsCount) {
                previousUnreadCount = unreadReportsCount;
                updateUnread(unreadReportsCount);
            }
        });
    },
});
