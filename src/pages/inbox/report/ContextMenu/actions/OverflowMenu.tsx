import {useRef} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import CONST from '@src/CONST';

type OverflowMenuProps = ContextMenuActionFocusProps;

function OverflowMenu({isFocused, onFocus, onBlur}: OverflowMenuProps) {
    const {openOverflowMenu, openContextMenu, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const icons = useMemoizedLazyExpensifyIcons(['ThreeDots'] as const);
    const {translate} = useLocalize();
    const threeDotRef = useRef<View>(null);

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
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            shouldPreventDefaultFocusOnPress={false}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MENU}
        />
    );
}

export default OverflowMenu;
