import type {CampfireVendor} from '@src/types/onyx/Policy';

type UpdateCampfireDefaultVendorParams = {
    policyID: string;
    vendorID: CampfireVendor['id'];
};

export default UpdateCampfireDefaultVendorParams;
