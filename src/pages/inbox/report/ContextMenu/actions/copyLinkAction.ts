import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Clipboard from '@libs/Clipboard';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {isActionOfType, isMessageDeleted, isReportActionAttachment} from '@libs/ReportActionsUtils';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type CopyLinkActionParams = BaseContextMenuActionParams & {
    reportAction: ReportAction;
    originalReportID: string | undefined;
    linkCopyIcon: IconAsset;
    checkmarkIcon: IconAsset;
};

function shouldShowCopyLinkAction({reportAction, menuTarget}: {reportAction: OnyxEntry<ReportAction>; menuTarget: RefObject<ContextMenuAnchor> | undefined}): boolean {
    const isAttachment = isReportActionAttachment(reportAction);
    const isAttachmentTarget = menuTarget?.current && 'tagName' in menuTarget.current && menuTarget?.current.tagName === 'IMG' && isAttachment;
    const isDEWRouted = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
    return !isAttachmentTarget && !isMessageDeleted(reportAction) && !isDEWRouted;
}

function createCopyLinkAction({reportAction, originalReportID, translate, linkCopyIcon, checkmarkIcon}: CopyLinkActionParams): ContextMenuAction {
    return {
        id: 'copyLink',
        icon: linkCopyIcon,
        text: translate('reportActionContextMenu.copyLink'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: checkmarkIcon,
        isAnonymousAction: true,
        onPress: () =>
            interceptAnonymousUser(() => {
                getEnvironmentURL().then((environmentURL) => {
                    const reportActionID = reportAction?.reportActionID;
                    Clipboard.setString(`${environmentURL}/r/${originalReportID}/${reportActionID}`);
                });
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK,
    };
}

export default createCopyLinkAction;
export {shouldShowCopyLinkAction};
