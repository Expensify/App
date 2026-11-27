import type {DualEntrySettlementStreamKey} from '@src/types/onyx/Policy';

type UpdateDualEntrySettlementStreamEnabledParams = {
    policyID: string;
    settlementStream: DualEntrySettlementStreamKey;
    enabled: boolean;
};

export default UpdateDualEntrySettlementStreamEnabledParams;
