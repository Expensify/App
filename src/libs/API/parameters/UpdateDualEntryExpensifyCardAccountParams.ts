import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryCreditCardAccountParams = {
    policyID: string;
    expensifyCardAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntryCreditCardAccountParams;
