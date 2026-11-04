import type {DigitsAccount} from '@src/types/onyx/Policy';

type UpdateDigitsCreditCardAccountParams = {
    policyID: string;
    creditCardAccountID: DigitsAccount['id'];
};

export default UpdateDigitsCreditCardAccountParams;
