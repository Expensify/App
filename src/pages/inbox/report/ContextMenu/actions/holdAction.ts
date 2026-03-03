import {changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createHoldAction(params: ContextMenuActionParams): ActionDescriptor {
    const {payload, icons} = params;
    const {moneyRequestAction, isDelegateAccessRestricted, showDelegateNoAccessModal, interceptAnonymousUser, hideAndRun, translate} = payload;

    return {
        id: 'hold',
        icon: icons.Stopwatch,
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
