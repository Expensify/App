import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

function isPendingDeleteOrUpdate(pendingAction: PendingAction | undefined): boolean {
    return pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
}

function getMccGroupDisplayName(groupID: string): string {
    return groupID.charAt(0).toUpperCase() + groupID.slice(1);
}

export {getMccGroupDisplayName, isPendingDeleteOrUpdate};
