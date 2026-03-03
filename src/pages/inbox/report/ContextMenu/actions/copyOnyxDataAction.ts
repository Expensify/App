import Clipboard from '@libs/Clipboard';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createCopyOnyxDataAction(params: ContextMenuActionParams): ActionDescriptor {
    const {report, interceptAnonymousUser, translate} = params.payload;
    const {Copy, Checkmark} = params.icons;

    return {
        id: 'copyOnyxData',
        icon: Copy,
        text: translate('reportActionContextMenu.copyOnyxData'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: Checkmark,
        isAnonymousAction: true,
        onPress: () =>
            interceptAnonymousUser(() => {
                Clipboard.setString(JSON.stringify(report, null, 4));
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_ONYX_DATA,
    };
}

export default createCopyOnyxDataAction;
