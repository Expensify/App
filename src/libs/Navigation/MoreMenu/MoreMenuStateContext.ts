/**
 * The state of the More menu of the flat nav tab bar. The tab navigator owns it, because the bar shows the More item as
 * selected for as long as the menu is up, and the More item opens the menu that the navigator shows.
 */
import type {Dispatch, SetStateAction} from 'react';

import {createContext} from 'react';

/** `closingAfterPick` is a menu closing because the user picked one of its entries, which is opened once it has closed. */
type MoreMenuState = 'closed' | 'open' | 'closing' | 'closingAfterPick';

const MoreMenuStateContext = createContext<[MoreMenuState, Dispatch<SetStateAction<MoreMenuState>>]>(['closed', () => {}]);

/**
 * Whether the menu keeps the More item selected. A menu closed without a pick gives the selection back as soon as it
 * starts closing. After a pick the item stays selected until the menu has closed and the entry opens, since every entry
 * is shown under the More item and the selection would otherwise leave it and come back.
 */
function isMoreItemSelectedByMenu(moreMenuState: MoreMenuState) {
    return moreMenuState === 'open' || moreMenuState === 'closingAfterPick';
}

export default MoreMenuStateContext;
export {isMoreItemSelectedByMenu};
export type {MoreMenuState};
