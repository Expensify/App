import type {QBDNonReimbursableExportAccountType} from '@src/types/onyx/Policy';

type UpdateQuickbooksCompanyCardExpenseAccountTypeParams = {
    policyID: string;
    nonReimbursableExpensesExportDestination: QBDNonReimbursableExportAccountType;
    nonReimbursableExpensesAccount: string;
    nonReimbursableBillDefaultVendor: string;
    idempotencyKey: string;
};

export default UpdateQuickbooksCompanyCardExpenseAccountTypeParams;
