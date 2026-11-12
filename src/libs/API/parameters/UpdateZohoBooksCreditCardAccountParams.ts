import type {ZohoBooksAccount} from '@src/types/onyx/Policy';

type UpdateZohoBooksCreditCardAccountParams = {
    policyID: string;
    creditCardAccountID: ZohoBooksAccount['id'];
};

export default UpdateZohoBooksCreditCardAccountParams;
