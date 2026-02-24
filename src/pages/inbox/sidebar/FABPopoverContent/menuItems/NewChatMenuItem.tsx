import React, {useLayoutEffect} from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import {startNewChat} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {useFABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import CONST from '@src/CONST';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.NEW_CHAT;

function NewChatMenuItem() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubble'] as const);
    const {focusedIndex, setFocusedIndex, onItemPress, registeredItems, registerItem, unregisterItem} = useFABMenuContext();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    useLayoutEffect(() => {
        registerItem(ITEM_ID);
        return () => unregisterItem(ITEM_ID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const itemIndex = registeredItems.indexOf(ITEM_ID);

    return (
        <FocusableMenuItem
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.START_CHAT}
            icon={icons.ChatBubble}
            title={translate('sidebarScreen.fabNewChat')}
            focused={focusedIndex === itemIndex}
            onFocus={() => setFocusedIndex(itemIndex)}
            onPress={() => onItemPress(() => interceptAnonymousUser(startNewChat), {shouldCallAfterModalHide: shouldUseNarrowLayout})}
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            wrapperStyle={StyleUtils.getItemBackgroundColorStyle(false, focusedIndex === itemIndex, false, theme.activeComponentBG, theme.hoverComponentBG)}
        />
    );
}

export default NewChatMenuItem;
