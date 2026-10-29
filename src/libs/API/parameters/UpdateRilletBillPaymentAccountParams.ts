import type {RilletAccount} from '@src/types/onyx/Policy';

type UpdateRilletBillPaymentAccountParams = {
    policyID: string;
    billPaymentAccountCode: RilletAccount['code'];
};

export default UpdateRilletBillPaymentAccountParams;
