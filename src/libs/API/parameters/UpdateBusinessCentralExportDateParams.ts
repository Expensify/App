import type {BusinessCentralExport} from '@src/types/onyx/Policy';

type UpdateBusinessCentralExportDateParams = {
    policyID: string;
    value: BusinessCentralExport['exportDate'];
};

export default UpdateBusinessCentralExportDateParams;
