import type {DigitsAccount} from '@src/types/onyx/Policy';

type UpdateDigitsTravelInvoicingPayableAccountParams = {
    policyID: string;
    travelInvoicingPayableAccountID: DigitsAccount['id'];
};

export default UpdateDigitsTravelInvoicingPayableAccountParams;
