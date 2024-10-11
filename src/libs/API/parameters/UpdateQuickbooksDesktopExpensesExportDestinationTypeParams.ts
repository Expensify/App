import type {QBDReimbursableExportAccountType} from '@src/types/onyx/Policy';

type UpdateQuickbooksDesktopExpensesExportDestinationTypeParams = {
    policyID: string;
    reimbursableExpensesExportDestination?: QBDReimbursableExportAccountType;
    reimbursableExpensesAccount?: string;
    idempotencyKey: string;
};

export default UpdateQuickbooksDesktopExpensesExportDestinationTypeParams;
