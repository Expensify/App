import React from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import {startNewChat} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {useFABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import CONST from '@src/CONST';

type NewChatMenuItemProps = {
    icons: MenuItemIcons;
    /** Injected by FABPopoverMenu via React.cloneElement */
    itemIndex?: number;
};

function NewChatMenuItem({icons, itemIndex = -1}: NewChatMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {focusedIndex, setFocusedIndex, onItemPress} = useFABMenuContext();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

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
