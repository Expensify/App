/** Resolves report columns that do not already have their own field in the expense view. */
import type {CurrencyListActionsContextType} from '@components/CurrencyListContextProvider';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SearchColumnType, SearchCustomColumnIds} from '@components/Search/types';

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

type AdditionalFieldContext = {
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

const additionalFieldValues = {
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE]: ({transaction, policyCategories}) => getCategoryGLCode(policyCategories, getCategory(transaction)),
    [CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE]: ({transaction, policyTags}) => getTagGLCode(policyTags, getTag(transaction)),
    [CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE]: ({transaction, report, policy}) => getExchangeRate(transaction, report.currency ?? policy?.outputCurrency, true),
    [CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT]: ({transaction, convertToDisplayString}) =>
        convertToDisplayString(getOriginalAmountForDisplay(transaction, true), getOriginalCurrencyForDisplay(transaction)),
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL]: ({transaction, report, policy, convertToDisplayString}) => {
        const {amount, currency} = getTotalForDisplay(transaction, report.currency ?? policy?.outputCurrency, true);
        return convertToDisplayString(amount, currency);
    },
    [CONST.SEARCH.TABLE_COLUMNS.POSTED]: ({transaction, dateFnsLocale}) => {
        const date = getFormattedPostedDate(transaction.posted);
        return date ? DateUtils.formatToLongDateInUTC(date, dateFnsLocale) : '';
    },
    [CONST.SEARCH.TABLE_COLUMNS.MCC]: ({transaction}) => getMCCForDisplay(transaction.mcc),
    [CONST.SEARCH.TABLE_COLUMNS.TAX_CODE]: ({transaction, policy}) => getTaxCodeForDisplay(transaction, policy),
    [CONST.SEARCH.TABLE_COLUMNS.HELD]: ({transaction, translate}) => translate(isOnHold(transaction) ? 'common.yes' : 'common.no'),
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE]: ({transaction, visibleAttendeeCount, translate, convertToDisplayString}) => {
        if (!visibleAttendeeCount) {
            return '';
        }
        return isScanning(transaction) ? translate('iou.receiptStatusTitle') : convertToDisplayString(getAmount(transaction, true) / visibleAttendeeCount, getCurrency(transaction));
    },
    [CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID]: ({transaction}) => transaction.withdrawalID,
    [CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_USER_ID]: ({report}) => getReportCustomColumnValue(CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_USER_ID, report),
    [CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID]: ({report}) => getReportCustomColumnValue(CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID, report),
    [CONST.SEARCH.TABLE_COLUMNS.ORDER_DEAL_NUMBERS]: ({report}) => getReportCustomColumnValue(CONST.SEARCH.TABLE_COLUMNS.ORDER_DEAL_NUMBERS, report),
} satisfies Partial<Record<SearchCustomColumnIds, (context: AdditionalFieldContext) => string | undefined>>;

type MoneyRequestAdditionalField = {
    column: keyof typeof additionalFieldValues;
    value: string | undefined;
};

function isMoneyRequestAdditionalFieldColumn(column: SearchColumnType): column is MoneyRequestAdditionalField['column'] {
    return Object.hasOwn(additionalFieldValues, column);
}

function getMoneyRequestAdditionalFields(params: AdditionalFieldContext & {columns: SearchColumnType[]}): MoneyRequestAdditionalField[] {
    return params.columns.filter(isMoneyRequestAdditionalFieldColumn).map((column) => ({column, value: additionalFieldValues[column](params)}));
}

export default getMoneyRequestAdditionalFields;
export {isMoneyRequestAdditionalFieldColumn};
export type {MoneyRequestAdditionalField};
