import Clipboard from '@libs/Clipboard';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createCopyLinkAction(params: ContextMenuActionParams): ActionDescriptor {
    const {reportAction, originalReportID, interceptAnonymousUser, translate} = params.payload;
    const {LinkCopy, Checkmark} = params.icons;

    return {
        id: 'copyLink',
        icon: LinkCopy,
        text: translate('reportActionContextMenu.copyLink'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: Checkmark,
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
