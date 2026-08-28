import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntrySettlementsAccountParams = {
    policyID: string;
    settlementsBankAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntrySettlementsAccountParams;
