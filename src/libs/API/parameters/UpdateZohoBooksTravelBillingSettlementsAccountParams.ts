import type {ZohoBooksAccount} from '@src/types/onyx/Policy';

type UpdateZohoBooksTravelBillingSettlementsAccountParams = {
    policyID: string;
    travelBillingSettlementsBankAccountID: ZohoBooksAccount['id'];
};

export default UpdateZohoBooksTravelBillingSettlementsAccountParams;
