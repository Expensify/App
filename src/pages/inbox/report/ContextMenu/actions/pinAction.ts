import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {togglePinnedState} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createPinAction(params: ContextMenuActionParams): ActionDescriptor {
    const {reportID, interceptAnonymousUser, hideAndRun, translate} = params.payload;
    const {Pin} = params.icons;

    return {
        id: 'pin',
        icon: Pin,
        text: translate('common.pin'),
        onPress: () =>
            interceptAnonymousUser(() => {
                togglePinnedState(reportID, false);
                hideAndRun(ReportActionComposeFocusManager.focus);
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.PIN,
    };
}

export default createPinAction;
