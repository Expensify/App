import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryTravelInvoicingSettlementsAccountParams = {
    policyID: string;
    travelInvoicingSettlementsBankAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntryTravelInvoicingSettlementsAccountParams;
