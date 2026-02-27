import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {QBDNonReimbursableExportAccountType, QBONonReimbursableExportAccountType} from '@src/types/onyx/Policy';

function getQBONonReimbursableExportAccountType(translate: LocalizedTranslate, exportDestination: QBONonReimbursableExportAccountType | undefined): string {
    switch (exportDestination) {
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD:
            return translate('workspace.qbo.bankAccount');
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            return translate('workspace.qbo.creditCardAccount');
        case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL:
            return translate('workspace.qbo.accountsPayable');
        default:
            return translate('workspace.qbo.account');
    }
}

function getQBDNonReimbursableExportAccountType(translate: LocalizedTranslate, exportDestination: QBDNonReimbursableExportAccountType | undefined): string {
    switch (exportDestination) {
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK:
            return translate('workspace.qbd.bankAccount');
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            return translate('workspace.qbd.creditCardAccount');
        case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL:
            return translate('workspace.qbd.accountsPayable');
        default:
            return translate('workspace.qbd.account');
    }
}

export {getQBONonReimbursableExportAccountType, getQBDNonReimbursableExportAccountType};
