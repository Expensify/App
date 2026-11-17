import type {BusinessCentralExport} from '@src/types/onyx/Policy';

type UpdateBusinessCentralReimbursableExpensesExportDestinationParams = {
    policyID: string;
    value: BusinessCentralExport['reimbursable'];
};

export default UpdateBusinessCentralReimbursableExpensesExportDestinationParams;
