import variables from '@styles/variables';

import SCREENS from '@src/SCREENS';

/**
 * Sidebar screens whose LHN is wider than the default. The Inbox needs the extra room for message previews.
 * Both the sidebar card and the central pane offset read their width from here, so the two always agree.
 */
const WIDTH_BY_SIDEBAR_SCREEN: Record<string, number> = {
    [SCREENS.INBOX]: variables.inboxSideBarWidth,
    [SCREENS.CONCIERGE_SIDEBAR]: variables.conciergeSideBarWidth,
};

function getSplitNavigatorSidebarWidth(sidebarScreenName?: string): number {
    return WIDTH_BY_SIDEBAR_SCREEN[sidebarScreenName ?? ''] ?? variables.sideBarWithLHBWidth;
}

/** The widest LHN any split navigator shows, so a layout sized against it fits beside every LHN. */
const WIDEST_SPLIT_NAVIGATOR_SIDEBAR_WIDTH = Math.max(variables.sideBarWithLHBWidth, ...Object.values(WIDTH_BY_SIDEBAR_SCREEN));

export default getSplitNavigatorSidebarWidth;
export {WIDEST_SPLIT_NAVIGATOR_SIDEBAR_WIDTH};
