import type SearchTabContextHoldProps from './types';

/** On web the hidden Spend tab is frozen, so there is nothing to hold. */
function SearchTabContextHold({children}: SearchTabContextHoldProps) {
    return children;
}

export default SearchTabContextHold;
