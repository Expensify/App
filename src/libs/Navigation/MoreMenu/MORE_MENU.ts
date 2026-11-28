import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';

import type {TupleToUnion, ValueOf} from 'type-fest';

const MORE_MENU = {
    ITEM: {
        ACCOUNTING: FLAT_NAV.SECTION.ACCOUNTING,
        SAVED: FLAT_NAV.SECTION.SAVED,
        INSIGHTS: 'insights',
        WORKSPACES: 'workspaces',
    },

    /** The entries that open a flat nav section, in the order the More menu lists them. */
    SECTION_ITEMS: [FLAT_NAV.SECTION.ACCOUNTING, FLAT_NAV.SECTION.SAVED],
} as const;

/** An entry of the More menu of the flat nav tab bar. */
type MoreMenuItemID = ValueOf<typeof MORE_MENU.ITEM>;

/** An entry of the More menu that opens a flat nav section. */
type MoreMenuSectionItemID = TupleToUnion<typeof MORE_MENU.SECTION_ITEMS>;

export default MORE_MENU;
export type {MoreMenuItemID, MoreMenuSectionItemID};
