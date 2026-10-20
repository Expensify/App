import type {CampfireAccount} from '@src/types/onyx/Policy';

type UpdateCampfireBillPaymentAccountParams = {
    policyID: string;
    billPaymentAccountID: CampfireAccount['id'];
};

export default UpdateCampfireBillPaymentAccountParams;
