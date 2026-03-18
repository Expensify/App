import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {startNewChat} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import CONST from '@src/CONST';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.NEW_CHAT;

function NewChatMenuItem() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubble'] as const);

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.START_CHAT}
            icon={icons.ChatBubble}
            title={translate('sidebarScreen.fabNewChat')}
            onPress={() => interceptAnonymousUser(startNewChat)}
            shouldCallAfterModalHide={shouldUseNarrowLayout}
        />
    );
}

export default NewChatMenuItem;
