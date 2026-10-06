import type {CampfireAccount} from '@src/types/onyx/Policy';

type UpdateCampfireCreditCardAccountParams = {
    policyID: string;
    creditCardAccountID: CampfireAccount['id'];
};

export default UpdateCampfireCreditCardAccountParams;
