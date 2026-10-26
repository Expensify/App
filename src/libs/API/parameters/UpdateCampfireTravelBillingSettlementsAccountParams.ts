import type {CampfireAccount} from '@src/types/onyx/Policy';

type UpdateCampfireTravelBillingSettlementsAccountParams = {
    policyID: string;
    travelBillingSettlementsBankAccountID: CampfireAccount['id'];
};

export default UpdateCampfireTravelBillingSettlementsAccountParams;
