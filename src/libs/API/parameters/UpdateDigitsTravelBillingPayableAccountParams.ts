import type {DigitsAccount} from '@src/types/onyx/Policy';

type UpdateDigitsTravelBillingPayableAccountParams = {
    policyID: string;
    travelBillingPayableAccountID: DigitsAccount['id'];
};

export default UpdateDigitsTravelBillingPayableAccountParams;
