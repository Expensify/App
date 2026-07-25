import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import type ClearReportNotifications from '@libs/Notification/clearReportNotifications/types';

import type {Policy, PolicyTagLists, Report, ReportAction, ReportAttributesDerivedValue} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type LocalNotificationClickHandler = () => void;

type LocalNotificationData = {
    reportID?: string;
};

type LocalNotificationModule = {
    showCommentNotification: (report: Report, reportAction: ReportAction, onClick: LocalNotificationClickHandler, reportAttributes?: ReportAttributesDerivedValue['reports']) => void;
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
    reportAttributes?: ReportAttributesDerivedValue['reports'];
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

type LocalNotificationModifiedExpensePushParams = LocalNotificationModifiedExpenseParams & {
    usesIcon?: boolean;
    policyTags: OnyxEntry<PolicyTagLists>;
    policy?: OnyxEntry<Policy>;
};

export type {LocalNotificationModule, LocalNotificationClickHandler, LocalNotificationData, LocalNotificationModifiedExpenseParams, LocalNotificationModifiedExpensePushParams};
