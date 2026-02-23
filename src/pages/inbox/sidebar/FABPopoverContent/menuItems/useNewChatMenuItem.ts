import {useMemo} from 'react';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import {startNewChat} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import CONST from '@src/CONST';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';

type UseNewChatMenuItemParams = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
};

function useNewChatMenuItem({shouldUseNarrowLayout, icons}: UseNewChatMenuItemParams): PopoverMenuItem[] {
    const {translate} = useLocalize();

    return useMemo(
        () => [
            {
                icon: icons.ChatBubble,
                text: translate('sidebarScreen.fabNewChat'),
                shouldCallAfterModalHide: shouldUseNarrowLayout,
                onSelected: () => interceptAnonymousUser(startNewChat),
                sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.START_CHAT,
            },
        ],
        [icons.ChatBubble, translate, shouldUseNarrowLayout],
    );
}

export default useNewChatMenuItem;
