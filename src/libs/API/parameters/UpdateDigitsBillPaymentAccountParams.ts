import type {DigitsAccount} from '@src/types/onyx/Policy';

type UpdateDigitsBillPaymentAccountParams = {
    policyID: string;
    billPaymentAccountID: DigitsAccount['id'];
};

export default UpdateDigitsBillPaymentAccountParams;
