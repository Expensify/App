import type {OnyxEntry} from 'react-native-onyx';
import type ClearReportNotifications from '@libs/Notification/clearReportNotifications/types';
import type {PolicyTagLists, Report, ReportAction} from '@src/types/onyx';

type LocalNotificationClickHandler = () => void;

type LocalNotificationData = {
    reportID?: string;
};

type LocalNotificationModule = {
    showCommentNotification: (report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, policyTags?: PolicyTagLists, usesIcon?: boolean) => void;
    showUpdateAvailableNotification: () => void;
    showModifiedExpenseNotification: (params: LocalNotificationModifiedExpenseParams) => void;
    clearReportNotifications: ClearReportNotifications;
};

type LocalNotificationModifiedExpenseParams = {
    report: Report;
    reportAction: ReportAction;
    onClick: LocalNotificationClickHandler;
    movedFromReport?: OnyxEntry<Report>;
    movedToReport?: OnyxEntry<Report>;
    policyTags?: PolicyTagLists;
};

type LocalNotificationModifiedExpensePushParams = LocalNotificationModifiedExpenseParams & {
    usesIcon?: boolean;
};

export type {LocalNotificationModule, LocalNotificationClickHandler, LocalNotificationData, LocalNotificationModifiedExpenseParams, LocalNotificationModifiedExpensePushParams};
