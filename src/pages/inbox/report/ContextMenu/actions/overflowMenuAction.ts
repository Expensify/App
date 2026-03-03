import type {RefObject} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

type OverflowMenuDescriptor = ActionDescriptor & {
    buttonRef: RefObject<View | null>;
};

function createOverflowMenuAction(params: ContextMenuActionParams, threeDotRef: RefObject<View | null>): OverflowMenuDescriptor {
    const {payload, icons} = params;
    const {openOverflowMenu, openContextMenu, interceptAnonymousUser, translate} = payload;

    return {
        id: 'overflowMenu',
        icon: icons.ThreeDots,
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
export type {OverflowMenuDescriptor};
