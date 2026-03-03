import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type MarkAsReadActionParams = BaseContextMenuActionParams & {
    reportID: string | undefined;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    hideAndRun: (callback?: () => void) => void;
    mailIcon: IconAsset;
    checkmarkIcon: IconAsset;
};

function createMarkAsReadAction({reportID, interceptAnonymousUser, hideAndRun, translate, mailIcon, checkmarkIcon}: MarkAsReadActionParams): ContextMenuAction {
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
