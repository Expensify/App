import type {CampfireAccount} from '@src/types/onyx/Policy';

type UpdateCampfireSettlementsAccountParams = {
    policyID: string;
    settlementsBankAccountID: CampfireAccount['id'];
};

export default UpdateCampfireSettlementsAccountParams;
