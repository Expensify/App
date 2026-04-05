import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type GustoApprovalMode = ValueOf<typeof CONST.GUSTO.APPROVAL_MODE>;

type GustoSettingRow = {
    title: string;
    description: string;
    route: string;
    pendingAction?: PendingAction | null;
    errors?: Errors | null;
};

export type {GustoApprovalMode, GustoSettingRow};
