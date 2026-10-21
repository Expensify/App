import type {BusinessCentralExport} from '@src/types/onyx/Policy';

type UpdateBusinessCentralExporterParams = {
    policyID: string;
    email: BusinessCentralExport['exporter'];
};

export default UpdateBusinessCentralExporterParams;
