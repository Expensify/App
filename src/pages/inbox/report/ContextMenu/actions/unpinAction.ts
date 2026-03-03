import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {togglePinnedState} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createUnpinAction(params: ContextMenuActionParams): ActionDescriptor {
    const {reportID, interceptAnonymousUser, hideAndRun, translate} = params.payload;
    const {Pin} = params.icons;

    return {
        id: 'unpin',
        icon: Pin,
        text: translate('common.unPin'),
        onPress: () =>
            interceptAnonymousUser(() => {
                togglePinnedState(reportID, true);
                hideAndRun(ReportActionComposeFocusManager.focus);
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.UNPIN,
    };
}

export default createUnpinAction;
