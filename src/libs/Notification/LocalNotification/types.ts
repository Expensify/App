import type ClearReportNotifications from '@libs/Notification/clearReportNotifications/types';

import type {Policy, PolicyTagLists, Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type LocalNotificationClickHandler = () => void;

type LocalNotificationData = {
    reportID?: string;
};

type LocalNotificationModule = {
    showCommentNotification: (report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, derivedReportName?: string) => void;
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
    currentUserLogin: string;
    derivedReportName?: string;
};

type LocalNotificationModifiedExpensePushParams = LocalNotificationModifiedExpenseParams & {
    usesIcon?: boolean;
    policyTags: OnyxEntry<PolicyTagLists>;
    policy?: OnyxEntry<Policy>;
};

export type {LocalNotificationModule, LocalNotificationClickHandler, LocalNotificationData, LocalNotificationModifiedExpenseParams, LocalNotificationModifiedExpensePushParams};
