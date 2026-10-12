import type {CampfireAccount} from '@src/types/onyx/Policy';

type UpdateCampfireTravelInvoicingPayableAccountParams = {
    policyID: string;
    travelInvoicingPayableAccountID: CampfireAccount['id'];
};

export default UpdateCampfireTravelInvoicingPayableAccountParams;
