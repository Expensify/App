import {useEffect} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';

/**
 * Clears local member selection after move flow completion by reacting to a
 * transition of `DOMAIN_MEMBERS_SELECTED_FOR_MOVE` from non-empty to empty.
 */
function useClearSelectedDomainMembersOnMoveComplete(clearSelectedMembers: () => void) {
    const [selectedMemberAccountIDs] = useOnyx(ONYXKEYS.DOMAIN_MEMBERS_SELECTED_FOR_MOVE, {initWithStoredValues: false});
    const prevSelectedMemberAccountIDs = usePrevious(selectedMemberAccountIDs);
    const selectedCount = selectedMemberAccountIDs?.length ?? 0;
    const previousSelectedCount = prevSelectedMemberAccountIDs?.length ?? 0;

    useEffect(() => {
        const hadSelectionBefore = previousSelectedCount > 0;
        const hasNoSelectionNow = selectedCount === 0;

        if (!hadSelectionBefore || !hasNoSelectionNow) {
            return;
        }

        clearSelectedMembers();
    }, [selectedCount, previousSelectedCount, clearSelectedMembers]);
}

export default useClearSelectedDomainMembersOnMoveComplete;
