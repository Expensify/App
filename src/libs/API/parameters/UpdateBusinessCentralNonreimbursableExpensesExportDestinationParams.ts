import type {BusinessCentralExport} from '@src/types/onyx/Policy';

type UpdateBusinessCentralNonreimbursableExpensesExportDestinationParams = {
    policyID: string;
    value: BusinessCentralExport['nonReimbursable'];
};

export default UpdateBusinessCentralNonreimbursableExpensesExportDestinationParams;
