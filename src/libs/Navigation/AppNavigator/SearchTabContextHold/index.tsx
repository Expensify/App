import type SearchTabContextHoldProps from './types';

/**
 * On web the Spend tab is frozen while it is in the background, so it does not re-render on data changes and there is
 * nothing to hold.
 */
function SearchTabContextHold({children}: SearchTabContextHoldProps) {
    return children;
}

export default SearchTabContextHold;
