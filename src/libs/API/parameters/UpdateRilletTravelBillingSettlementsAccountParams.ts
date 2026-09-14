import type {RilletBankAccount} from '@src/types/onyx/Policy';

type UpdateRilletTravelBillingSettlementsAccountParams = {
    policyID: string;
    travelBillingSettlementsBankAccountID: RilletBankAccount['id'];
};

export default UpdateRilletTravelBillingSettlementsAccountParams;
