import type {OnyxEntry} from 'react-native-onyx';
import {isActionOfType} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

function shouldShowMarkAsUnreadForReportAction({reportAction}: {reportAction: OnyxEntry<ReportAction>}): boolean {
    return !isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
}

function shouldShowMarkAsUnreadForReport({isUnreadChat}: {isUnreadChat: boolean}): boolean {
    return !isUnreadChat;
}

export {shouldShowMarkAsUnreadForReportAction, shouldShowMarkAsUnreadForReport};
