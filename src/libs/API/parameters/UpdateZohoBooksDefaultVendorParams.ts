import type {ZohoBooksVendor} from '@src/types/onyx/Policy';

type UpdateZohoBooksDefaultVendorParams = {
    policyID: string;
    vendorID: ZohoBooksVendor['id'];
};

export default UpdateZohoBooksDefaultVendorParams;
