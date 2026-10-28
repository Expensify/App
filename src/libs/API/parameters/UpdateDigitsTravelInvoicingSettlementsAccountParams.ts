import type {DigitsAccount} from '@src/types/onyx/Policy';

type UpdateDigitsTravelInvoicingSettlementsAccountParams = {
    policyID: string;
    travelInvoicingSettlementsBankAccountID: DigitsAccount['id'];
};

export default UpdateDigitsTravelInvoicingSettlementsAccountParams;
