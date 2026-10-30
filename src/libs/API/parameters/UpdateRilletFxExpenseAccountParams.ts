import type {RilletAccount} from '@src/types/onyx/Policy';

type UpdateRilletFxExpenseAccountParams = {
    policyID: string;
    fxExpenseAccountCode: RilletAccount['code'];
};

export default UpdateRilletFxExpenseAccountParams;
