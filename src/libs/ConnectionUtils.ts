import CONST from '@src/CONST';
import type {QBDNonReimbursableExportAccountType, QBONonReimbursableExportAccountType} from '@src/types/onyx/Policy';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';

function getQBONonReimbursableExportAccountType(exportDestination: QBONonReimbursableExportAccountType | undefined): string {
    switch (exportDestination) {
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspace.qbo.bankAccount');
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspace.qbo.creditCardAccount');
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspace.qbo.accountsPayable');
        default:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspace.qbo.account');
    }
}

function getQBDNonReimbursableExportAccountType(exportDestination: QBDNonReimbursableExportAccountType | undefined): string {
    switch (exportDestination) {
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspace.qbd.bankAccount');
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspace.qbd.creditCardAccount');
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspace.qbd.accountsPayable');
        default:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspace.qbd.account');
    }
}

export {getQBONonReimbursableExportAccountType, getQBDNonReimbursableExportAccountType};
