/** Removes source workspace feedback after applying queued field deletions to a copied setting. */
import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

function buildDuplicateSettingSnapshot<T extends object>(
    setting: T & {pendingFields?: Partial<Record<string, PendingAction>>; pendingAction?: PendingAction; errors?: unknown; errorFields?: unknown},
): T {
    const snapshot = {...setting};
    for (const [field, pendingAction] of Object.entries(setting.pendingFields ?? {})) {
        if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            Reflect.deleteProperty(snapshot, field);
        }
    }
    delete snapshot.pendingFields;
    delete snapshot.pendingAction;
    delete snapshot.errors;
    delete snapshot.errorFields;
    return snapshot;
}

export default buildDuplicateSettingSnapshot;
