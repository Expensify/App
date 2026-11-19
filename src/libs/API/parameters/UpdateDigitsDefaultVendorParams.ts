import type {DigitsVendor} from '@src/types/onyx/Policy';

type UpdateDigitsDefaultVendorParams = {
    policyID: string;
    vendorID: DigitsVendor['id'];
};

export default UpdateDigitsDefaultVendorParams;
