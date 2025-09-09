import type ClearReportNotifications from '@libs/Notification/clearReportNotifications/types';
import type {PolicyTagLists, Report, ReportAction} from '@src/types/onyx';

type LocalNotificationClickHandler = () => void;

type LocalNotificationData = {
    reportID?: string;
};

type LocalNotificationModule = {
    showCommentNotification: (report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, policyTags?: PolicyTagLists, usesIcon?: boolean) => void;
    showUpdateAvailableNotification: () => void;
    showModifiedExpenseNotification: (report: Report, reportAction: ReportAction, policyTags: PolicyTagLists, onClick: LocalNotificationClickHandler) => void;
    clearReportNotifications: ClearReportNotifications;
};

export type {LocalNotificationModule, LocalNotificationClickHandler, LocalNotificationData};
