import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';

import type {ValueOf} from 'type-fest';

const MORE_MENU = {
    ITEM: {
        ACCOUNTING: FLAT_NAV.SECTION.ACCOUNTING,
        SAVED: FLAT_NAV.SECTION.SAVED,
        INSIGHTS: 'insights',
        WORKSPACES: 'workspaces',
    },
} as const;

/** An entry of the More menu of the flat nav tab bar. */
type MoreMenuItemID = ValueOf<typeof MORE_MENU.ITEM>;

/** An entry of the More menu that opens a flat nav section. */
type MoreMenuSectionItemID = typeof MORE_MENU.ITEM.ACCOUNTING | typeof MORE_MENU.ITEM.SAVED;

export default MORE_MENU;
export type {MoreMenuItemID, MoreMenuSectionItemID};
