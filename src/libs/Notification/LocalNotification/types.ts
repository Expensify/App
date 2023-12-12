import {ImageSourcePropType} from 'react-native';
import {OnyxEntry} from 'react-native-onyx';
import {Report, ReportAction} from '@src/types/onyx';

type PushParams = {
    title: string;
    body?: string;
    icon?: string | ImageSourcePropType;
    delay?: number;
    onClick?: () => void;
    tag?: string;
};

type ReportCommentParams = {
    report: OnyxEntry<Report>;
    reportAction: ReportAction;
    onClick: () => void;
};

type LocalNotificationModule = {
    showCommentNotification: (reportCommentParams: ReportCommentParams) => void;
    showUpdateAvailableNotification: () => void;
    showModifiedExpenseNotification: (reportCommentParams: ReportCommentParams) => void;
};

export type {PushParams, ReportCommentParams, LocalNotificationModule};
