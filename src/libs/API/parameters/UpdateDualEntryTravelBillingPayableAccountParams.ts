import type {DualEntryAccount} from '@src/types/onyx/Policy';

type UpdateDualEntryTravelBillingPayableAccountParams = {
    policyID: string;
    travelBillingPayableAccountID: DualEntryAccount['id'];
};

export default UpdateDualEntryTravelBillingPayableAccountParams;
