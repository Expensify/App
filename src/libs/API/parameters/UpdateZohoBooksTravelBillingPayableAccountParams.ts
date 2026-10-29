import type {ZohoBooksAccount} from '@src/types/onyx/Policy';

type UpdateZohoBooksTravelBillingPayableAccountParams = {
    policyID: string;
    travelBillingPayableAccountID: ZohoBooksAccount['id'];
};

export default UpdateZohoBooksTravelBillingPayableAccountParams;
