import {changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type HoldActionParams = BaseContextMenuActionParams & {
    moneyRequestAction: ReportAction | undefined;
    isDelegateAccessRestricted: boolean;
    showDelegateNoAccessModal: (() => void) | undefined;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    hideAndRun: (callback?: () => void) => void;
    stopwatchIcon: IconAsset;
};

function createHoldAction({moneyRequestAction, isDelegateAccessRestricted, showDelegateNoAccessModal, interceptAnonymousUser, hideAndRun, translate, stopwatchIcon}: HoldActionParams): ContextMenuAction {
    return {
        id: 'hold',
        icon: stopwatchIcon,
        text: translate('iou.hold'),
        onPress: () =>
            interceptAnonymousUser(() => {
                if (isDelegateAccessRestricted) {
                    hideContextMenu(false, showDelegateNoAccessModal);
                    return;
                }
                hideAndRun(() => changeMoneyRequestHoldStatus(moneyRequestAction));
            }, false),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.HOLD,
    };
}

export default createHoldAction;
