/**
 * Decides when an expanded Search group should collapse after its loaded children are deleted.
 */
import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type ShouldCollapseExpandedGroupAfterPendingDeleteParams = {
    isExpanded: boolean;
    groupPendingAction?: PendingAction;
    loadedChildrenCount: number;
    remainingChildrenCount: number;
};

/**
 * Collapse when every loaded child is pending-delete and the group itself is not.
 *
 * A query `limit:` smaller than the group count only deletes the loaded rows, so the group stays in
 * the list. Leaving it expanded would keep showing those deleted children instead of the remaining
 * expenses. A whole-group pending delete stays expanded so offline pending-delete styling still
 * shows. Zero loaded children means the group has not been fetched yet, so expanding a lazy group
 * must not collapse immediately.
 */
function shouldCollapseExpandedGroupAfterPendingDelete({
    isExpanded,
    groupPendingAction,
    loadedChildrenCount,
    remainingChildrenCount,
}: ShouldCollapseExpandedGroupAfterPendingDeleteParams): boolean {
    if (!isExpanded || loadedChildrenCount === 0 || remainingChildrenCount > 0) {
        return false;
    }

    return groupPendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

export default shouldCollapseExpandedGroupAfterPendingDelete;
