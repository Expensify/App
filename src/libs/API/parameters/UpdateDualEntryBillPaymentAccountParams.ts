import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryBillPaymentAccountParams = {
    policyID: string;
    billPaymentAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntryBillPaymentAccountParams;
