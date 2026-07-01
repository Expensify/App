import type {RilletVendor} from '@src/types/onyx/Policy';

type UpdateRilletDefaultVendorParams = {
    policyID: string;
    vendorID: RilletVendor['id'];
};

export default UpdateRilletDefaultVendorParams;
