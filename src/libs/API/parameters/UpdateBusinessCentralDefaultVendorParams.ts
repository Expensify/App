import type {BusinessCentralExport} from '@src/types/onyx/Policy';

type UpdateBusinessCentralDefaultVendorParams = {
    policyID: string;
    vendorID: BusinessCentralExport['defaultVendorID'];
};

export default UpdateBusinessCentralDefaultVendorParams;
