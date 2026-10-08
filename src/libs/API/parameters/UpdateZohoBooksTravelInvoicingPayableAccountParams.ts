import type {ZohoBooksAccount} from '@src/types/onyx/Policy';

type UpdateZohoBooksTravelInvoicingPayableAccountParams = {
    policyID: string;
    travelInvoicingPayableAccountID: ZohoBooksAccount['id'];
};

export default UpdateZohoBooksTravelInvoicingPayableAccountParams;
