import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type ClearReportNotifications from '@libs/Notification/clearReportNotifications/types';
import type {Report, ReportAction} from '@src/types/onyx';

type LocalNotificationClickHandler = () => void;

type LocalNotificationData = {
    reportID?: string;
};

type LocalNotificationModule = {
    showCommentNotification: (report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, formatPhoneNumber: LocaleContextProps['formatPhoneNumber']) => void;
    showUpdateAvailableNotification: () => void;
    showModifiedExpenseNotification: (report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, formatPhoneNumber: LocaleContextProps['formatPhoneNumber']) => void;
    clearReportNotifications: ClearReportNotifications;
};

export type {LocalNotificationModule, LocalNotificationClickHandler, LocalNotificationData};
