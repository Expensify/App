import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {togglePinnedState} from '@userActions/Report';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionConfig';

type UnpinActionParams = BaseContextMenuActionParams & {
    reportID: string | undefined;
    hideAndRun: (callback?: () => void) => void;
    pinIcon: IconAsset;
};

function shouldShowUnpinAction({isPinnedChat}: {isPinnedChat: boolean}): boolean {
    return isPinnedChat;
}

function createUnpinAction({reportID, hideAndRun, translate, pinIcon}: UnpinActionParams): ContextMenuAction {
    return {
        id: 'unpin',
        icon: pinIcon,
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
export {shouldShowUnpinAction};
