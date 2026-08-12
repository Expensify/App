import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryExpensifyCardAccountParams = {
    policyID: string;
    expensifyCardAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntryExpensifyCardAccountParams;
