import type {RefObject} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type OverflowMenuDescriptor = ContextMenuAction & {
    buttonRef: RefObject<View | null>;
};

type OverflowMenuActionParams = BaseContextMenuActionParams & {
    openOverflowMenu: (event: GestureResponderEvent | MouseEvent, anchorRef: RefObject<View | null>) => void;
    openContextMenu: () => void;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    threeDotsIcon: IconAsset;
};

function createOverflowMenuAction({openOverflowMenu, openContextMenu, interceptAnonymousUser, translate, threeDotsIcon}: OverflowMenuActionParams, threeDotRef: RefObject<View | null>): OverflowMenuDescriptor {
    return {
        id: 'overflowMenu',
        icon: threeDotsIcon,
        text: translate('reportActionContextMenu.menu'),
        isAnonymousAction: true,
        shouldPreventDefaultFocusOnPress: false,
        buttonRef: threeDotRef,
        onPress: (event) =>
            interceptAnonymousUser(() => {
                openOverflowMenu(event as GestureResponderEvent | MouseEvent, threeDotRef);
                openContextMenu();
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MENU,
    };
}

export default createOverflowMenuAction;
