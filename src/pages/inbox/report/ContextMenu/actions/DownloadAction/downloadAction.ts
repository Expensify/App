import type {OnyxEntry} from 'react-native-onyx';
import {isMessageDeleted, isReportActionAttachment} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
// eslint-disable-next-line @dword-design/import-alias/prefer-alias -- subdirectory relative to actions/actionConfig
import {getActionHtml} from '../actionConfig';

function shouldShowDownloadAction({reportAction, isOffline}: {reportAction: OnyxEntry<ReportAction>; isOffline: boolean}): boolean {
    const isAttachment = isReportActionAttachment(reportAction);
    const html = getActionHtml(reportAction);
    const isUploading = html.includes(CONST.ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE);
    return isAttachment && !isUploading && !!reportAction?.reportActionID && !isMessageDeleted(reportAction) && !isOffline;
}

// eslint-disable-next-line import/prefer-default-export -- named utility export per module convention
export {shouldShowDownloadAction};
