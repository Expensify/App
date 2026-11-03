import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryFxExpenseAccountParams = {
    policyID: string;
    fxExpenseAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntryFxExpenseAccountParams;
