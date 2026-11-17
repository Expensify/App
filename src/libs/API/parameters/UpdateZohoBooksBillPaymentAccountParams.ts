import type {ZohoBooksAccount} from '@src/types/onyx/Policy';

type UpdateZohoBooksBillPaymentAccountParams = {
    policyID: string;
    billPaymentAccountID: ZohoBooksAccount['id'];
};

export default UpdateZohoBooksBillPaymentAccountParams;
