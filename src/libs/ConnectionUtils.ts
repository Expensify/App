import CONST from '@src/CONST';
import type {QBDNonReimbursableExportAccountType, QBONonReimbursableExportAccountType} from '@src/types/onyx/Policy';
import {translateLocal} from './Localize';

function getQBONonReimbursableExportAccountType(exportDestination: QBONonReimbursableExportAccountType | undefined): string {
    switch (exportDestination) {
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD:
            return translateLocal('workspace.qbo.bankAccount');
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            return translateLocal('workspace.qbo.creditCardAccount');
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL:
            return translateLocal('workspace.qbo.accountsPayable');
        default:
            return translateLocal('workspace.qbo.account');
    }
}

function getQBDNonReimbursableExportAccountType(exportDestination: QBDNonReimbursableExportAccountType | undefined): string {
    switch (exportDestination) {
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.JOURNAL_ENTRY:
            return translateLocal(`workspace.qbd.accounts.${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.JOURNAL_ENTRY}`);
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            return translateLocal('workspace.qbd.creditCardAccount');
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL:
            return translateLocal('workspace.qbd.accountsPayable');
        default:
            return translateLocal('workspace.qbd.account');
    }
}

export {getQBONonReimbursableExportAccountType, getQBDNonReimbursableExportAccountType};
