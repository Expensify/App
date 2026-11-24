/**
 * The entries of the More menu of the flat nav tab bar, in render order, with the one the user is on marked. Accounting
 * and Saved are listed only when their flat nav section is visible and has a search to open.
 */
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import {getFlatNavSectionDefaultItem} from '@libs/Navigation/FlatNav/FlatNavUtils';
import type {FlatNavSection} from '@libs/Navigation/FlatNav/types';
import type FlatNavTabBarFocus from '@libs/Navigation/FlatNavTabBar/FlatNavTabBarFocus';

import type {TranslationPaths} from '@src/languages/types';

import type {MoreMenuSectionItemID} from './MORE_MENU';

import getMoreTabItemID from './getMoreTabItemID';
import MORE_MENU from './MORE_MENU';

type MoreMenuItemBase = {
    translationPath: TranslationPaths;
    iconName: ExpensifyIconName;
    isActive: boolean;
};

type MoreMenuSectionItem = MoreMenuItemBase & {
    id: MoreMenuSectionItemID;

    /** The flat nav section the entry opens */
    section: FlatNavSection;

    /** Todo count of the section, as its badge shows it. Undefined when the section has no todo searches or their count is 0. */
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
    const activeItemID = getMoreTabItemID({focusedTabRouteName, activeFlatNavSectionID});

    const items: MoreMenuItem[] = [];
    for (const id of SECTION_ITEM_IDS) {
        const section = sections.find((visibleSection) => visibleSection.id === id);
        // Offline, the Saved section stays visible while all its saved searches are pending delete, and none of them can be opened.
        if (!section || !getFlatNavSectionDefaultItem(section)) {
            continue;
        }
        items.push({
            id,
            translationPath: section.translationPath,
            iconName: section.iconName,
            isActive: activeItemID === id,
            section,
            badgeText: section.badgeText,
        });
    }
    items.push(
        {id: MORE_MENU.ITEM.INSIGHTS, translationPath: 'common.insights', iconName: 'PieChart', isActive: activeItemID === MORE_MENU.ITEM.INSIGHTS},
        {
            id: MORE_MENU.ITEM.WORKSPACES,
            translationPath: 'common.workspacesTabTitle',
            iconName: 'Buildings',
            isActive: activeItemID === MORE_MENU.ITEM.WORKSPACES,
            indicatorColor: workspacesDotColor,
        },
    );
    return items;
}

export default getMoreMenuItems;
export type {GetMoreMenuItemsParams, MoreMenuItem};
