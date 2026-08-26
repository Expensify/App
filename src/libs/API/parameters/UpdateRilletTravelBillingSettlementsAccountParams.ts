import type {RilletBankAccount} from '@src/types/onyx/Policy';

type UpdateRilletTravelBillingSettlementsAccountParams = {
    policyID: string;
    travelInvoicingSettlementsBankAccountID: RilletBankAccount['id'];
};

export default UpdateRilletTravelBillingSettlementsAccountParams;
