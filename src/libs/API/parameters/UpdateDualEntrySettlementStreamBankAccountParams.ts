import type {DualEntryAccount, DualEntrySettlementStreamKey} from '@src/types/onyx/Policy';

type UpdateDualEntrySettlementStreamBankAccountParams = {
    policyID: string;
    settlementStream: DualEntrySettlementStreamKey;
    settlementsBankAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntrySettlementStreamBankAccountParams;
