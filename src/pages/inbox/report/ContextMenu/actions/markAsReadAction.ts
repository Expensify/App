import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type MarkAsReadActionParams = BaseContextMenuActionParams & {
    reportID: string | undefined;
    hideAndRun: (callback?: () => void) => void;
    mailIcon: IconAsset;
    checkmarkIcon: IconAsset;
};

function shouldShowMarkAsReadAction({isUnreadChat}: {isUnreadChat: boolean}): boolean {
    return isUnreadChat;
}

function createMarkAsReadAction({reportID, hideAndRun, translate, mailIcon, checkmarkIcon}: MarkAsReadActionParams): ContextMenuAction {
    return {
        id: 'markAsRead',
        icon: mailIcon,
        text: translate('reportActionContextMenu.markAsRead'),
        successIcon: checkmarkIcon,
        onPress: () =>
            interceptAnonymousUser(() => {
                readNewestAction(reportID, true, true);
                hideAndRun(ReportActionComposeFocusManager.focus);
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_READ,
    };
}

export default createMarkAsReadAction;
export {shouldShowMarkAsReadAction};
