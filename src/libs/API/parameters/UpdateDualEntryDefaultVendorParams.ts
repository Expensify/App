import type {DualEntryVendor} from '@src/types/onyx/Policy';

type UpdateDualEntryDefaultVendorParams = {
    policyID: string;
    vendorID: DualEntryVendor['id'];
};

export default UpdateDualEntryDefaultVendorParams;
