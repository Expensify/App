import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {togglePinnedState} from '@userActions/Report';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type PinActionParams = BaseContextMenuActionParams & {
    reportID: string | undefined;
    hideAndRun: (callback?: () => void) => void;
    pinIcon: IconAsset;
};

function shouldShowPinAction({isPinnedChat}: {isPinnedChat: boolean}): boolean {
    return !isPinnedChat;
}

function createPinAction({reportID, hideAndRun, translate, pinIcon}: PinActionParams): ContextMenuAction {
    return {
        id: 'pin',
        icon: pinIcon,
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
export {shouldShowPinAction};
