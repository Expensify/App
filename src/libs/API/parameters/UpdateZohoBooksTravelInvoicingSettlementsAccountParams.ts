import type {ZohoBooksAccount} from '@src/types/onyx/Policy';

type UpdateZohoBooksTravelInvoicingSettlementsAccountParams = {
    policyID: string;
    travelInvoicingSettlementsBankAccountID: ZohoBooksAccount['id'];
};

export default UpdateZohoBooksTravelInvoicingSettlementsAccountParams;
