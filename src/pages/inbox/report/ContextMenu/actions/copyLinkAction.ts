import Clipboard from '@libs/Clipboard';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type CopyLinkActionParams = BaseContextMenuActionParams & {
    reportAction: ReportAction;
    originalReportID: string | undefined;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    linkCopyIcon: IconAsset;
    checkmarkIcon: IconAsset;
};

function createCopyLinkAction({reportAction, originalReportID, interceptAnonymousUser, translate, linkCopyIcon, checkmarkIcon}: CopyLinkActionParams): ContextMenuAction {
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
