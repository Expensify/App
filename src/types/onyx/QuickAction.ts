import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Names of quick actions that the user can execute */
type QuickActionName = ValueOf<typeof CONST.QUICK_ACTIONS>;

/** Model of user quick action */
type QuickAction = {
    action?: QuickActionName;
    chatReportID?: string;

    /** ID of the target account for task actions */
    targetAccountID?: number;

    isFirstQuickAction?: boolean;

    /** ID of the per diem policy for track per diem quick actions */
    perDiemPolicyID?: string;
};

export default QuickAction;

export type {QuickActionName};
