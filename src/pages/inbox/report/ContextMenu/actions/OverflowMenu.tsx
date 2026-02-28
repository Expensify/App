import {useRef} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import CONST from '@src/CONST';
import {ACTION_IDS} from './actionConfig';

function OverflowMenu() {
    const {openOverflowMenu, openContextMenu, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const icons = useMemoizedLazyExpensifyIcons(['ThreeDots'] as const);
    const {translate} = useLocalize();
    const threeDotRef = useRef<View>(null);

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.OVERFLOW_MENU);
    if (actionIndex === -1) {
        return null;
    }

    const handlePress = (event?: GestureResponderEvent | MouseEvent | KeyboardEvent) => {
        openOverflowMenu(event as GestureResponderEvent | MouseEvent, threeDotRef);
        openContextMenu();
    };

    return (
        <ContextMenuItem
            buttonRef={threeDotRef}
            icon={icons.ThreeDots}
            text={translate('reportActionContextMenu.menu')}
            isMini={isMini}
            onPress={(event) => interceptAnonymousUser(() => handlePress(event), true)}
            isAnonymousAction
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            shouldPreventDefaultFocusOnPress={false}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MENU}
        />
    );
}

export default OverflowMenu;
