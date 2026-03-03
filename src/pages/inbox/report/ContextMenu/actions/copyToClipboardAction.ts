import Clipboard from '@libs/Clipboard';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type CopyToClipboardActionParams = BaseContextMenuActionParams & {
    selection: string;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    copyIcon: IconAsset;
    checkmarkIcon: IconAsset;
};

function createCopyToClipboardAction({selection, interceptAnonymousUser, translate, copyIcon, checkmarkIcon}: CopyToClipboardActionParams): ContextMenuAction {
    return {
        id: 'copyToClipboard',
        icon: copyIcon,
        text: translate('common.copyToClipboard'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: checkmarkIcon,
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
