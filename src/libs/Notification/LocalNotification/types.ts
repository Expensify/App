import {Report, ReportAction} from '@src/types/onyx';

type LocalNotificationClickHandler = () => void;

type LocalNotificationData = {
    reportID?: string;
};

type LocalNotificationModule = {
    showCommentNotification: (report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler) => void;
    showUpdateAvailableNotification: () => void;
    showModifiedExpenseNotification: (report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler) => void;
    clearReportNotifications: (reportID: string) => void;
};

export type {LocalNotificationModule, LocalNotificationClickHandler, LocalNotificationData};
