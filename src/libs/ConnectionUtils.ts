import CONST from '@src/CONST';
import type {QBDNonReimbursableExportAccountType, QBONonReimbursableExportAccountType} from '@src/types/onyx/Policy';

function getQBONonReimbursableExportAccountType(exportDestination: QBONonReimbursableExportAccountType | undefined) {
    switch (exportDestination) {
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD:
            return 'workspace.qbo.bankAccount';
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            return 'workspace.qbo.creditCardAccount';
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL:
            return 'workspace.qbo.accountsPayable';
        default:
            return 'workspace.qbo.account';
    }
}

function getQBDNonReimbursableExportAccountType(exportDestination: QBDNonReimbursableExportAccountType | undefined) {
    switch (exportDestination) {
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK:
            return 'workspace.qbd.bankAccount';
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            return 'workspace.qbd.creditCardAccount';
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL:
            return 'workspace.qbd.accountsPayable';
        default:
            return 'workspace.qbd.account';
    }
}

export {getQBONonReimbursableExportAccountType, getQBDNonReimbursableExportAccountType};
