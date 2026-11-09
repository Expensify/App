import useIsSupportalSession from '@hooks/useIsSupportalSession';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {showSupportalPermissionDenied} from '@libs/actions/App';
import {startNewChat} from '@libs/actions/Report';
import {WRITE_COMMANDS} from '@libs/API/types';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';

import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.NEW_CHAT;

function NewChatMenuItem() {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubble']);
    const isSupportalSession = useIsSupportalSession();

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.START_CHAT}
            icon={icons.ChatBubble}
            title={translate('sidebarScreen.fabNewChat')}
            onPress={() => {
                // Support agents cannot create chats on a user's behalf, so block before the selector opens.
                if (isSupportalSession) {
                    showSupportalPermissionDenied({command: WRITE_COMMANDS.OPEN_REPORT});
                    return;
                }
                interceptAnonymousUser(startNewChat, session);
            }}
            shouldCallAfterModalHide={shouldUseNarrowLayout}
        />
    );
}

export default NewChatMenuItem;
