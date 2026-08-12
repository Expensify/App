import type {DualEntryVendor} from '@src/types/onyx/Policy';

type UpdateDualEntryDefaultVendorParams = {
    /** Workspace whose default vendor is updated. */
    policyID: string;

    /** DualEntry vendor used as the direct-expense fallback. */
    vendorID: DualEntryVendor['id'];
};

export default UpdateDualEntryDefaultVendorParams;
