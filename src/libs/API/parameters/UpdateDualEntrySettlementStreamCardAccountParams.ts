import type {DualEntryAccount, DualEntrySettlementStreamKey} from '@src/types/onyx/Policy';

type UpdateDualEntrySettlementStreamCardAccountParams = {
    policyID: string;
    settlementStream: DualEntrySettlementStreamKey;
    settlementsCardAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntrySettlementStreamCardAccountParams;
