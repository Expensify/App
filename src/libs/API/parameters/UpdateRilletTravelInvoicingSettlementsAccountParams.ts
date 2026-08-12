import type {RilletBankAccount} from '@src/types/onyx/Policy';

type UpdateRilletTravelInvoicingSettlementsAccountParams = {
    policyID: string;
    travelInvoicingSettlementsBankAccountID: RilletBankAccount['id'];
};

export default UpdateRilletTravelInvoicingSettlementsAccountParams;
