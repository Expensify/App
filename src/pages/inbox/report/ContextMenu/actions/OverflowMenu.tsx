import {useRef} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import type {ContextMenuPayloadContextValue} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';

type OverflowMenuDescriptor = ActionDescriptor & {
    buttonRef: React.RefObject<View | null>;
};

function useOverflowMenuAction(payloadOverride?: ContextMenuPayloadContextValue): OverflowMenuDescriptor | null {
    const {openOverflowMenu, openContextMenu, interceptAnonymousUser} = useContextMenuPayload(payloadOverride);
    const icons = useMemoizedLazyExpensifyIcons(['ThreeDots'] as const);
    const {translate} = useLocalize();
    const threeDotRef = useRef<View>(null);

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

export default useOverflowMenuAction;
export type {OverflowMenuDescriptor};
