import type {BusinessCentralExport} from '@src/types/onyx/Policy';

type UpdateBusinessCentralExportToMultipleAccountsParams = {
    policyID: string;
    enabled: BusinessCentralExport['exportToMultipleAccounts'];
};

export default UpdateBusinessCentralExportToMultipleAccountsParams;
