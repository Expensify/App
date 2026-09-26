import type {CampfireAccount} from '@src/types/onyx/Policy';

type UpdateCampfireTravelInvoicingSettlementsAccountParams = {
    policyID: string;
    travelInvoicingSettlementsBankAccountID: CampfireAccount['id'];
};

export default UpdateCampfireTravelInvoicingSettlementsAccountParams;
