import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryExpensifyCardAccountParams = {
    /** Workspace whose Expensify Card account is updated. */
    policyID: string;

    /** DualEntry account used for Expensify Card expenses. */
    creditCardAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntryExpensifyCardAccountParams;
