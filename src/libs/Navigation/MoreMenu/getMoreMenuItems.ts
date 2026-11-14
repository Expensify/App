/**
 * The entries of the More menu of the flat nav tab bar, in render order, with the one the user is on marked. Accounting
 * and Saved are listed only when their flat nav section is visible.
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

    /** The flat nav section the entry opens */
    section: FlatNavSection;

    badgeText?: string;
};

type MoreMenuInsightsItem = MoreMenuItemBase & {
    id: typeof MORE_MENU.ITEM.INSIGHTS;
};

type MoreMenuWorkspacesItem = MoreMenuItemBase & {
    id: typeof MORE_MENU.ITEM.WORKSPACES;

    /** Color of the status dot, undefined for no dot */
    indicatorColor?: string;
};

type MoreMenuItem = MoreMenuSectionItem | MoreMenuInsightsItem | MoreMenuWorkspacesItem;

type GetMoreMenuItemsParams = FlatNavTabBarFocus & {
    /** The sections the user can see, from `buildFlatNavSections` */
    sections: FlatNavSection[];

    /** The Workspaces tab dot color, undefined for no dot */
    workspacesDotColor?: string;
};

const SECTION_ITEM_IDS: readonly MoreMenuSectionItemID[] = [MORE_MENU.ITEM.ACCOUNTING, MORE_MENU.ITEM.SAVED];

function getMoreMenuItems({sections, focusedTabRouteName, activeFlatNavSectionID, workspacesDotColor}: GetMoreMenuItemsParams): MoreMenuItem[] {
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
    items.push(
        {id: MORE_MENU.ITEM.INSIGHTS, translationPath: 'common.insights', iconName: 'PieChart', isActive: focusedTabRouteName === SCREENS.INSIGHTS},
        {
            id: MORE_MENU.ITEM.WORKSPACES,
            translationPath: 'common.workspacesTabTitle',
            iconName: 'Buildings',
            isActive: focusedTabRouteName === NAVIGATORS.WORKSPACE_NAVIGATOR,
            indicatorColor: workspacesDotColor,
        },
    );
    return items;
}

export default getMoreMenuItems;
export type {GetMoreMenuItemsParams, MoreMenuItem};
