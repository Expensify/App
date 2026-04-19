import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {isActionOfType, isMessageDeleted, isReportActionAttachment} from '@libs/ReportActionsUtils';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

function shouldShowCopyLinkAction({reportAction, menuTarget}: {reportAction: OnyxEntry<ReportAction>; menuTarget: RefObject<ContextMenuAnchor> | undefined}): boolean {
    const isAttachment = isReportActionAttachment(reportAction);
    const isAttachmentTarget = menuTarget?.current && 'tagName' in menuTarget.current && menuTarget?.current.tagName === 'IMG' && isAttachment;
    const isDEWRouted = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
    return !isAttachmentTarget && !isMessageDeleted(reportAction) && !isDEWRouted;
}

// eslint-disable-next-line import/prefer-default-export -- named utility export per module convention
export {shouldShowCopyLinkAction};
