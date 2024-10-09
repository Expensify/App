import debounce from 'lodash/debounce';
import type {OnyxCollection} from 'react-native-onyx';
import memoize from '@libs/memoize';
import * as ReportConnection from '@libs/ReportConnection';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation, {navigationRef} from '@navigation/Navigation';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import updateUnread from './updateUnread';

function getUnreadReportsForUnreadIndicator(reports: OnyxCollection<Report>, currentReportID: string) {
    return Object.values(reports ?? {}).filter((report) => {
        const notificationPreference = ReportUtils.getReportNotificationPreference(report);
        return (
            ReportUtils.isUnread(report) &&
            ReportUtils.shouldReportBeInOptionList({
                report,
                currentReportId: currentReportID,
                betas: [],
                policies: {},
                doesReportHaveViolations: false,
                isInFocusMode: false,
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
            notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN &&
            notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE
        );
    });
}

const memoizedGetUnreadReportsForUnreadIndicator = memoize(getUnreadReportsForUnreadIndicator, {maxArgs: 1});

const triggerUnreadUpdate = debounce(() => {
    const currentReportID = navigationRef?.isReady?.() ? Navigation.getTopmostReportId() ?? '-1' : '-1';

    // We want to keep notification count consistent with what can be accessed from the LHN list
    const unreadReports = memoizedGetUnreadReportsForUnreadIndicator(ReportConnection.getAllReports(), currentReportID);

    updateUnread(unreadReports.length);
}, CONST.TIMING.UNREAD_UPDATE_DEBOUNCE_TIME);

navigationRef?.addListener?.('state', () => {
    triggerUnreadUpdate();
});

export {triggerUnreadUpdate, getUnreadReportsForUnreadIndicator};
