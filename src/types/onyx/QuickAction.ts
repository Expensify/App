import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type QuickActionName = ValueOf<typeof CONST.QUICK_ACTIONS>;

type QuickAction = {
    /** The action to take */
    action?: QuickActionName;

    /** ID of the report */
    chatReportID?: string;

    /** ID of the target account for task actions */
    targetAccountID?: number;

    /** True if it is the first quick action we store for this user */
    isFirstQuickAction?: boolean;
};

export default QuickAction;

export type {QuickActionName};
