import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type CategorizeTrackedExpenseParams from './CategorizeTrackedExpenseParams';

// AddTrackedExpenseToPolicy is a backend alias of CategorizeTrackedExpense, so it accepts the same
// parameters (including the optional workspace-creation params used when moving a tracked expense into
// a newly created draft workspace).
type AddTrackedExpenseToPolicyParams = CategorizeTrackedExpenseParams & {
    reimbursable?: boolean;
    distance?: number;
    shouldDeferAutoSubmit?: boolean;
    /** Name to give the workspace when one is created as part of this request, so the backend matches the optimistic name. */
    policyName?: string;
    /** Policy type to create when a workspace is created as part of this request (e.g. submit2026 for "Submit to my employer"). */
    type?: ValueOf<typeof CONST.POLICY.TYPE>;
};

export default AddTrackedExpenseToPolicyParams;
