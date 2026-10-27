import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryTravelInvoicingPayableAccountParams = {
    policyID: string;
    travelInvoicingPayableAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntryTravelInvoicingPayableAccountParams;
