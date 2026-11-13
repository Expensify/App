import type {DigitsAccount} from '@src/types/onyx/Policy';

type UpdateDigitsSettlementsAccountParams = {
    policyID: string;
    settlementsBankAccountID: DigitsAccount['id'];
};

export default UpdateDigitsSettlementsAccountParams;
