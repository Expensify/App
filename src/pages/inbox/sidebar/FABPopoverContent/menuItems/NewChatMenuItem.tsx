import React from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {startNewChat} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import useFABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/useFABMenuItem';
import CONST from '@src/CONST';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.NEW_CHAT;

function NewChatMenuItem() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubble'] as const);
    const {itemIndex, isFocused, wrapperStyle, setFocusedIndex, onItemPress} = useFABMenuItem(ITEM_ID);

    return (
        <FocusableMenuItem
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.START_CHAT}
            icon={icons.ChatBubble}
            title={translate('sidebarScreen.fabNewChat')}
            focused={isFocused}
            onFocus={() => setFocusedIndex(itemIndex)}
            onPress={() => onItemPress(() => interceptAnonymousUser(startNewChat), {shouldCallAfterModalHide: shouldUseNarrowLayout})}
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            wrapperStyle={wrapperStyle}
        />
    );
}

export default NewChatMenuItem;
