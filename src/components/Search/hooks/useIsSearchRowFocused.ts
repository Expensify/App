import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

/** Whether this Search row has keyboard focus. Each row subscribes to its own key, so moving focus re-renders only the two rows it moves between. */
function useIsSearchRowFocused(keyForList: string | undefined): boolean {
    const [isFocused] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_SEARCH_ROW_FOCUS}${getNonEmptyStringOnyxID(keyForList)}`);
    return !!isFocused;
}

export default useIsSearchRowFocused;
