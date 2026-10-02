import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {QBDNonReimbursableExportAccountType, QBONonReimbursableExportAccountType} from '@src/types/onyx/Policy';

import type {ValueOf} from 'type-fest';

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

/**
 * Resolves a stored Sage Intacct export date onto a value the export date picker actually offers.
 *
 * A workspace configured before NewDot aligned with the backend still holds the legacy `EXPORTED` / `SUBMITTED`, which
 * matches no row in the picker and has no translation key of its own. Mapping it onto the equivalent `REPORT_*` value
 * keeps the right option selected and the right label rendered. Anything unrecognized resolves to `undefined` so
 * callers render nothing rather than guessing at a label.
 *
 * Takes a plain `string` rather than {@link SageIntacctExportDate} on purpose: the stored value comes from the
 * backend unvalidated, so handling values outside that union is the whole point of this function.
 */
function getSageIntacctExportDate(exportDate: string | undefined): ValueOf<typeof CONST.SAGE_INTACCT_EXPORT_DATE> | undefined {
    switch (exportDate) {
        case CONST.SAGE_INTACCT_EXPORT_DATE_LEGACY.EXPORTED:
            return CONST.SAGE_INTACCT_EXPORT_DATE.REPORT_EXPORTED;
        case CONST.SAGE_INTACCT_EXPORT_DATE_LEGACY.SUBMITTED:
            return CONST.SAGE_INTACCT_EXPORT_DATE.REPORT_SUBMITTED;
        default:
            return Object.values(CONST.SAGE_INTACCT_EXPORT_DATE).find((value) => value === exportDate);
    }
}

export {getQBONonReimbursableExportAccountType, getQBDNonReimbursableExportAccountType, getSageIntacctExportDate};
