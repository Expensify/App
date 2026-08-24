import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryExpensifyCardAccountParams = {
    policyID: string;
    creditCardAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntryExpensifyCardAccountParams;
