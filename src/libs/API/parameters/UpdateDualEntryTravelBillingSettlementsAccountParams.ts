import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryTravelBillingSettlementsAccountParams = {
    policyID: string;
    travelBillingSettlementsBankAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntryTravelBillingSettlementsAccountParams;
