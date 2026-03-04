import type {GestureResponderEvent} from 'react-native';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionConfig';

type OverflowMenuActionParams = BaseContextMenuActionParams & {
    openOverflowMenu: (event: GestureResponderEvent | MouseEvent) => void;
    openContextMenu: () => void;
    threeDotsIcon: IconAsset;
};

function createOverflowMenuAction({openOverflowMenu, openContextMenu, translate, threeDotsIcon}: OverflowMenuActionParams): ContextMenuAction {
    return {
        id: 'overflowMenu',
        icon: threeDotsIcon,
        text: translate('reportActionContextMenu.menu'),
        isAnonymousAction: true,
        shouldPreventDefaultFocusOnPress: false,
        onPress: (event) =>
            interceptAnonymousUser(() => {
                openOverflowMenu(event as GestureResponderEvent | MouseEvent);
                openContextMenu();
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MENU,
    };
}

export default createOverflowMenuAction;
