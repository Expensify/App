import variables from '@styles/variables';

import SCREENS from '@src/SCREENS';

/**
 * Sidebar screens whose LHN is wider than the default. The Inbox needs the extra room for message previews.
 * Both the sidebar card and the central pane offset read their width from here, so the two always agree.
 */
const WIDTH_BY_SIDEBAR_SCREEN: Record<string, number> = {
    [SCREENS.INBOX]: variables.inboxSideBarWidth,
};

function getSplitNavigatorSidebarWidth(sidebarScreenName?: string): number {
    return WIDTH_BY_SIDEBAR_SCREEN[sidebarScreenName ?? ''] ?? variables.sideBarWithLHBWidth;
}

export default getSplitNavigatorSidebarWidth;
