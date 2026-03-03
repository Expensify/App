import Clipboard from '@libs/Clipboard';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type CopyURLActionParams = BaseContextMenuActionParams & {
    selection: string;
    copyIcon: IconAsset;
    checkmarkIcon: IconAsset;
};

function createCopyURLAction({selection, translate, copyIcon, checkmarkIcon}: CopyURLActionParams): ContextMenuAction {
    return {
        id: 'copyUrl',
        icon: copyIcon,
        text: translate('reportActionContextMenu.copyURLToClipboard'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: checkmarkIcon,
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
