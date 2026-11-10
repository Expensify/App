import type {ValueOf} from 'type-fest';

/**
 * The five items of the flat nav tab bar, meant for both the native and the mWeb bar. A slot is not a route: Expenses and
 * Reports both show the Search navigator, and More stands for several routes.
 */
const FLAT_NAV_TAB_BAR_SLOT = {
    HOME: 'home',
    INBOX: 'inbox',
    EXPENSES: 'expenses',
    REPORTS: 'reports',
    MORE: 'more',
} as const;

type FlatNavTabBarSlot = ValueOf<typeof FLAT_NAV_TAB_BAR_SLOT>;

export default FLAT_NAV_TAB_BAR_SLOT;
export type {FlatNavTabBarSlot};
