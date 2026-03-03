import Clipboard from '@libs/Clipboard';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createCopyToClipboardAction(params: ContextMenuActionParams): ActionDescriptor {
    const {selection, interceptAnonymousUser, translate} = params.payload;
    const {Copy, Checkmark} = params.icons;

    return {
        id: 'copyToClipboard',
        icon: Copy,
        text: translate('common.copyToClipboard'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: Checkmark,
        isAnonymousAction: true,
        onPress: () =>
            interceptAnonymousUser(() => {
                Clipboard.setString(selection);
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_TO_CLIPBOARD,
    };
}

export default createCopyToClipboardAction;
