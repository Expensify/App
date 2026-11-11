import type {DigitsAccount} from '@src/types/onyx/Policy';

type UpdateDigitsTravelBillingSettlementsAccountParams = {
    policyID: string;
    travelBillingSettlementsBankAccountID: DigitsAccount['id'];
};

export default UpdateDigitsTravelBillingSettlementsAccountParams;
