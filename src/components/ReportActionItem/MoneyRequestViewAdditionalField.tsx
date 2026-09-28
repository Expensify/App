import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {SearchColumnType} from '@components/Search/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {getCategoryGLCode} from '@libs/CategoryUtils';
import DateUtils from '@libs/DateUtils';
import {getTagGLCode, isTaxCodeCustomized} from '@libs/PolicyUtils';
import {getReportCustomColumnValue, isExpenseReport} from '@libs/ReportUtils';
import {getSearchColumnTranslationKey} from '@libs/SearchUIUtils';
import {
    getAmount,
    getCategory,
    getConvertedAmount,
    getCurrency,
    getExchangeRate,
    getMCCForDisplay,
    getOriginalAmountForDisplay,
    getOriginalCurrencyForDisplay,
    getTag,
    isPerDiemRequest,
    isTimeRequest,
} from '@libs/TransactionUtils';
import getFormattedPostedDate from '@libs/TransactionUtils/getFormattedPostedDate';

import CONST from '@src/CONST';
import type {Policy, PolicyCategories, PolicyTagLists, Report, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type MoneyRequestViewAdditionalFieldProps = {
    column: SearchColumnType;
    transaction: Transaction;
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    policyTagLists: OnyxEntry<PolicyTagLists>;
    attendeeCount: number;
};

/** Read-only report columns reuse the table's value and formatting helpers. */
function MoneyRequestViewAdditionalField({column, transaction, report, policy, policyCategories, policyTagLists, attendeeCount}: MoneyRequestViewAdditionalFieldProps) {
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const isFromExpenseReport = isExpenseReport(report);
    let value: string | undefined;

    switch (column) {
        case CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE:
            value = getCategoryGLCode(policyCategories, getCategory(transaction));
            break;
        case CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE:
            value = getTagGLCode(policyTagLists, getTag(transaction));
            break;
        case CONST.SEARCH.TABLE_COLUMNS.MCC:
            value = getMCCForDisplay(transaction.mcc);
            break;
        case CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE:
            value = getExchangeRate(transaction, report?.currency ?? policy?.outputCurrency, true);
            break;
        case CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT:
            value = convertToDisplayString(getOriginalAmountForDisplay(transaction, isFromExpenseReport), getOriginalCurrencyForDisplay(transaction));
            break;
        case CONST.SEARCH.TABLE_COLUMNS.TOTAL: {
            const hasConvertedAmount = transaction.convertedAmount != null;
            const amount = hasConvertedAmount ? getConvertedAmount(transaction, isFromExpenseReport) : getAmount(transaction, isFromExpenseReport);
            const currency = hasConvertedAmount ? (report?.currency ?? policy?.outputCurrency ?? getCurrency(transaction)) : getCurrency(transaction);
            value = convertToDisplayString(amount, currency);
            break;
        }
        case CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE:
            value = attendeeCount ? convertToDisplayString(getAmount(transaction, isFromExpenseReport) / attendeeCount, getCurrency(transaction)) : '';
            break;
        case CONST.SEARCH.TABLE_COLUMNS.POSTED:
            value = transaction.posted ? DateUtils.formatWithUTCTimeZone(getFormattedPostedDate(transaction.posted), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, dateFnsLocale) : '';
            break;
        case CONST.SEARCH.TABLE_COLUMNS.TAX_CODE:
            value = isPerDiemRequest(transaction) || isTimeRequest(transaction) || !isTaxCodeCustomized(transaction.taxCode, policy) ? '' : transaction.taxCode;
            break;
        case CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID:
            value = transaction.withdrawalID;
            break;
        case CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_USER_ID:
        case CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID:
        case CONST.SEARCH.TABLE_COLUMNS.ORDER_DEAL_NUMBERS:
            value = getReportCustomColumnValue(column, report);
            break;
        default:
            return null;
    }

    return (
        <MenuItemWithTopDescription
            description={translate(getSearchColumnTranslationKey(column))}
            title={value ?? ''}
            interactive={false}
            shouldShowRightIcon={false}
            copyable={!!value}
            copyValue={value}
            numberOfLinesTitle={2}
        />
    );
}

export default MoneyRequestViewAdditionalField;
