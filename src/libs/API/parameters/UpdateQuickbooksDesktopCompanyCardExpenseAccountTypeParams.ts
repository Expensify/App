import type {QBDNonReimbursableExportAccountType} from '@src/types/onyx/Policy';

type UpdateQuickbooksDesktopCompanyCardExpenseAccountTypeParams = {
    policyID: string;
    nonReimbursableExpensesExportDestination: QBDNonReimbursableExportAccountType;
    nonReimbursableExpensesAccount: string;
    nonReimbursableBillDefaultVendor: string;
    idempotencyKey: string;
};

export default UpdateQuickbooksDesktopCompanyCardExpenseAccountTypeParams;
