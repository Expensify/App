/**
 * The entries of the More menu of the flat nav tab bar, in render order, with the one the user is on marked. Meant for
 * both the native and the mWeb bar. It holds no visibility rules of its own: Accounting and Saved follow the visible
 * flat nav sections and the caller says whether Insights is available.
 */
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import type {FlatNavSection} from '@libs/Navigation/FlatNav/types';
import type FlatNavTabBarFocus from '@libs/Navigation/FlatNavTabBar/FlatNavTabBarFocus';

import type {TranslationPaths} from '@src/languages/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import MORE_MENU from './MORE_MENU';

type MoreMenuSectionItemID = typeof MORE_MENU.ITEM.ACCOUNTING | typeof MORE_MENU.ITEM.SAVED;

type MoreMenuItemBase = {
    translationPath: TranslationPaths;
    iconName: ExpensifyIconName;
    isActive: boolean;
};

type MoreMenuSectionItem = MoreMenuItemBase & {
    id: MoreMenuSectionItemID;

    /** The visible flat nav section the entry opens, for `navigateToSection` of `useFlatNavNavigation` */
    section: FlatNavSection;

    /** Todo count of the section, from `FlatNavSection.badgeText`. Undefined when it has no todo items or its count is 0. */
    badgeText?: string;
};

type MoreMenuInsightsItem = MoreMenuItemBase & {
    id: typeof MORE_MENU.ITEM.INSIGHTS;
};

type MoreMenuWorkspacesItem = MoreMenuItemBase & {
    id: typeof MORE_MENU.ITEM.WORKSPACES;

    /** Color of the status dot. Undefined when the Workspaces indicator has no status, so no dot is drawn. */
    indicatorColor?: string;
};

type MoreMenuItem = MoreMenuSectionItem | MoreMenuInsightsItem | MoreMenuWorkspacesItem;

type GetMoreMenuItemsParams = FlatNavTabBarFocus & {
    /** The sections the user can see, from `buildFlatNavSections` */
    sections: FlatNavSection[];

    isInsightsAvailable: boolean;

    /** The Workspaces tab dot color, the same value the tab bar draws. Undefined draws no dot. */
    workspacesDotColor?: string;
};

const SECTION_ITEM_IDS: readonly MoreMenuSectionItemID[] = [MORE_MENU.ITEM.ACCOUNTING, MORE_MENU.ITEM.SAVED];

/**
 * Takes the same focus as `getFlatNavTabBarSlot`. `useActiveFlatNavItem` only clears the section off Search when its
 * caller passes the right `isSearchFocused`, so the section is ignored here unless Search is the focused route, which
 * is also the only route where the slot reads it.
 */
function getMoreMenuItems({sections, isInsightsAvailable, focusedTabRouteName, activeFlatNavSectionID, workspacesDotColor}: GetMoreMenuItemsParams): MoreMenuItem[] {
    const activeSectionID = focusedTabRouteName === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR ? activeFlatNavSectionID : undefined;

    const items: MoreMenuItem[] = [];
    for (const id of SECTION_ITEM_IDS) {
        const section = sections.find((visibleSection) => visibleSection.id === id);
        if (!section) {
            continue;
        }
        items.push({
            id,
            translationPath: section.translationPath,
            iconName: section.iconName,
            isActive: activeSectionID === id,
            section,
            badgeText: section.badgeText,
        });
    }
    if (isInsightsAvailable) {
        items.push({id: MORE_MENU.ITEM.INSIGHTS, translationPath: 'common.insights', iconName: 'PieChart', isActive: focusedTabRouteName === SCREENS.INSIGHTS});
    }
    items.push({
        id: MORE_MENU.ITEM.WORKSPACES,
        translationPath: 'common.workspacesTabTitle',
        iconName: 'Buildings',
        isActive: focusedTabRouteName === NAVIGATORS.WORKSPACE_NAVIGATOR,
        indicatorColor: workspacesDotColor,
    });
    return items;
}

export default getMoreMenuItems;
export type {GetMoreMenuItemsParams, MoreMenuItem};
