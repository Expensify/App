/** Resolves report columns that do not already have their own field in the expense view. */
import type {CurrencyListActionsContextType} from '@components/CurrencyListContextProvider';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SearchColumnType} from '@components/Search/types';

import CONST from '@src/CONST';
import type {Policy, PolicyCategories, PolicyTagLists, Report, Transaction} from '@src/types/onyx';

import type {Locale} from 'date-fns';

import {getCategoryGLCode} from './CategoryUtils';
import DateUtils from './DateUtils';
import {getTagGLCode} from './PolicyUtils';
import {getReportCustomColumnValue} from './ReportUtils';
import {
    getAmount,
    getCategory,
    getCurrency,
    getExchangeRate,
    getMCCForDisplay,
    getOriginalAmountForDisplay,
    getOriginalCurrencyForDisplay,
    getTag,
    getTotalForDisplay,
    isOnHold,
    isScanning,
} from './TransactionUtils';
import getFormattedPostedDate from './TransactionUtils/getFormattedPostedDate';
import {getTaxCodeForDisplay} from './TransactionUtils/tax';

type GetMoneyRequestAdditionalFieldsParams = {
    columns: SearchColumnType[];
    dateFnsLocale?: Locale;
    transaction: Transaction;
    report: Report;
    policy: Policy | undefined;
    policyCategories: PolicyCategories | undefined;
    policyTags: PolicyTagLists | undefined;
    visibleAttendeeCount: number;
    translate: LocalizedTranslate;
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'];
};

type MoneyRequestAdditionalField = {
    column: (typeof CONST.SEARCH.TABLE_COLUMNS)[keyof typeof CONST.SENTRY_LABEL.MONEY_REQUEST_VIEW.ADDITIONAL_FIELD];
    value: string | undefined;
};

function getMoneyRequestAdditionalFields({
    columns,
    transaction,
    report,
    policy,
    policyCategories,
    policyTags,
    visibleAttendeeCount,
    translate,
    convertToDisplayString,
    dateFnsLocale,
}: GetMoneyRequestAdditionalFieldsParams): MoneyRequestAdditionalField[] {
    const fields: MoneyRequestAdditionalField[] = [];

    for (const column of columns) {
        switch (column) {
            case CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE:
                fields.push({column, value: getCategoryGLCode(policyCategories, getCategory(transaction))});
                break;
            case CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE:
                fields.push({column, value: getTagGLCode(policyTags, getTag(transaction))});
                break;
            case CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE:
                fields.push({column, value: getExchangeRate(transaction, report.currency ?? policy?.outputCurrency, true)});
                break;
            case CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT:
                fields.push({column, value: convertToDisplayString(getOriginalAmountForDisplay(transaction, true), getOriginalCurrencyForDisplay(transaction))});
                break;
            case CONST.SEARCH.TABLE_COLUMNS.TOTAL: {
                const {amount, currency} = getTotalForDisplay(transaction, report.currency ?? policy?.outputCurrency, true);
                fields.push({column, value: convertToDisplayString(amount, currency)});
                break;
            }
            case CONST.SEARCH.TABLE_COLUMNS.POSTED: {
                const date = getFormattedPostedDate(transaction.posted);
                const value = date ? DateUtils.formatToLongDateInUTC(date, dateFnsLocale) : '';
                fields.push({column, value});
                break;
            }
            case CONST.SEARCH.TABLE_COLUMNS.MCC:
                fields.push({column, value: getMCCForDisplay(transaction.mcc)});
                break;
            case CONST.SEARCH.TABLE_COLUMNS.TAX_CODE:
                fields.push({column, value: getTaxCodeForDisplay(transaction, policy)});
                break;
            case CONST.SEARCH.TABLE_COLUMNS.HELD:
                fields.push({column, value: translate(isOnHold(transaction) ? 'common.yes' : 'common.no')});
                break;
            case CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE: {
                let value = '';
                if (visibleAttendeeCount) {
                    value = isScanning(transaction)
                        ? translate('iou.receiptStatusTitle')
                        : convertToDisplayString(getAmount(transaction, true) / visibleAttendeeCount, getCurrency(transaction));
                }
                fields.push({column, value});
                break;
            }
            case CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID:
                fields.push({column, value: transaction.withdrawalID});
                break;
            case CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_USER_ID:
            case CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID:
            case CONST.SEARCH.TABLE_COLUMNS.ORDER_DEAL_NUMBERS:
                fields.push({column, value: getReportCustomColumnValue(column, report)});
                break;
            default:
                // Receipt, date, merchant, classification and the other editable fields already belong to MoneyRequestView.
                break;
        }
    }

    return fields;
}

export default getMoneyRequestAdditionalFields;
export type {MoneyRequestAdditionalField};
