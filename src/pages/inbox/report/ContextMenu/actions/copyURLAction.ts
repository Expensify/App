import Clipboard from '@libs/Clipboard';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createCopyURLAction(params: ContextMenuActionParams): ActionDescriptor {
    const {selection, interceptAnonymousUser, translate} = params.payload;
    const {Copy, Checkmark} = params.icons;

    return {
        id: 'copyUrl',
        icon: Copy,
        text: translate('reportActionContextMenu.copyURLToClipboard'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: Checkmark,
        description: selection,
        isAnonymousAction: true,
        onPress: () =>
            interceptAnonymousUser(() => {
                Clipboard.setString(selection);
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_URL,
    };
}

export default createCopyURLAction;
