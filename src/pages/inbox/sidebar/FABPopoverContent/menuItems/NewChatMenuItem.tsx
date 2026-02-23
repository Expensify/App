import React from 'react';
import useLocalize from '@hooks/useLocalize';
import {startNewChat} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import FABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABMenuItem';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import CONST from '@src/CONST';

type NewChatMenuItemProps = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
};

function NewChatMenuItem({shouldUseNarrowLayout, icons}: NewChatMenuItemProps) {
    const {translate} = useLocalize();

    return (
        <FABMenuItem
            registryId={CONST.SENTRY_LABEL.FAB_MENU.START_CHAT}
            icon={icons.ChatBubble}
            text={translate('sidebarScreen.fabNewChat')}
            shouldCallAfterModalHide={shouldUseNarrowLayout}
            onSelected={() => interceptAnonymousUser(startNewChat)}
            sentryLabel={CONST.SENTRY_LABEL.FAB_MENU.START_CHAT}
        />
    );
}

export default NewChatMenuItem;
