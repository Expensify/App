import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation, {navigationRef} from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import updateUnread from './updateUnread';

let allReports: OnyxCollection<Report> = {};

export default function getUnreadReportsForUnreadIndicator(reports: OnyxCollection<Report>, currentReportID: string) {
    return Object.values(reports ?? {}).filter(
        (report) =>
            ReportUtils.isUnread(report) &&
            ReportUtils.shouldReportBeInOptionList({
                report,
                currentReportId: currentReportID ?? '',
                betas: [],
                policies: {},
                doesReportHaveViolations: false,
                isInGSDMode: false,
                excludeEmptyChats: false,
            }) &&
            /**
             * Chats with hidden preference remain invisible in the LHN and are not considered "unread."
             * They are excluded from the LHN rendering, but not filtered from the "option list."
             * This ensures they appear in Search, but not in the LHN or unread count.
             *
             * Furthermore, muted reports may or may not appear in the LHN depending on priority mode,
             * but they should not be considered in the unread indicator count.
             */
            report?.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN &&
            report?.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE,
    );
}

const triggerUnreadUpdate = () => {
    const currentReportID = navigationRef.isReady() ? Navigation.getTopmostReportId() ?? '' : '';

    // We want to keep notification count consistent with what can be accessed from the LHN list
    const unreadReports = getUnreadReportsForUnreadIndicator(allReports, currentReportID);
    updateUnread(unreadReports.length);
};

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reportsFromOnyx) => {
        allReports = reportsFromOnyx;
        triggerUnreadUpdate();
    },
});

navigationRef.addListener('state', () => {
    triggerUnreadUpdate();
});
