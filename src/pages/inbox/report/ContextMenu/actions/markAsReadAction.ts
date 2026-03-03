import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createMarkAsReadAction(params: ContextMenuActionParams): ActionDescriptor {
    const {reportID, interceptAnonymousUser, hideAndRun, translate} = params.payload;
    const {Mail, Checkmark} = params.icons;

    return {
        id: 'markAsRead',
        icon: Mail,
        text: translate('reportActionContextMenu.markAsRead'),
        successIcon: Checkmark,
        onPress: () =>
            interceptAnonymousUser(() => {
                readNewestAction(reportID, true, true);
                hideAndRun(ReportActionComposeFocusManager.focus);
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_READ,
    };
}

export default createMarkAsReadAction;
