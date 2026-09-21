import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryCreditCardAccountParams = {
    policyID: string;
    creditCardAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntryCreditCardAccountParams;
