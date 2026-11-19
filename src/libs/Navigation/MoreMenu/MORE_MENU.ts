import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';

const MORE_MENU = {
    ITEM: {
        ACCOUNTING: FLAT_NAV.SECTION.ACCOUNTING,
        SAVED: FLAT_NAV.SECTION.SAVED,
        INSIGHTS: 'insights',
        WORKSPACES: 'workspaces',
    },
} as const;

export default MORE_MENU;
