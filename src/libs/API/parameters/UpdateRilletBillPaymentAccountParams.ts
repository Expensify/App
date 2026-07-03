import type {RilletAccount} from '@src/types/onyx/Policy';

type UpdateRilletBillPaymentAccountParams = {
    policyID: string;
    accountCode: RilletAccount['code'];
};

export default UpdateRilletBillPaymentAccountParams;
