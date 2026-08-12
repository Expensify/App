import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryCreditCardAccountParams = {
    /** Workspace whose default card account is updated. */
    policyID: string;

    /** DualEntry account used for company card expenses. */
    accountID: DualEntryAccount['id'];
};

export default UpdateDualEntryCreditCardAccountParams;
