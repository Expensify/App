import type {ZohoBooksAccount} from '@src/types/onyx/Policy';

type UpdateZohoBooksSettlementsAccountParams = {
    policyID: string;
    settlementsBankAccountID: ZohoBooksAccount['id'];
};

export default UpdateZohoBooksSettlementsAccountParams;
