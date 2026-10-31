import type {CampfireAccount} from '@src/types/onyx/Policy';

type UpdateCampfireTravelBillingPayableAccountParams = {
    policyID: string;
    travelBillingPayableAccountID: CampfireAccount['id'];
};

export default UpdateCampfireTravelBillingPayableAccountParams;
