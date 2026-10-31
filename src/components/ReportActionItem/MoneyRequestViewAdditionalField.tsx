/** Read-only report columns reuse the table's value and formatting helpers. */
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import type {SearchColumnType} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';

import {getCategoryGLCode} from '@libs/CategoryUtils';
import {getTagGLCode, isTaxCodeCustomized} from '@libs/PolicyUtils';
import {getReportCustomColumnValue} from '@libs/ReportUtils';
import {getSearchColumnTranslationKey} from '@libs/SearchUIUtils';
import {getCategory, getExchangeRate, getMCCForDisplay, getTag, isPerDiemRequest, isTimeRequest} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {Policy, PolicyCategories, PolicyTagLists, Report, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type MoneyRequestViewAdditionalFieldProps = {
    /** Report column to display outside the existing editable expense fields. */
    column: SearchColumnType;

    /** Expense whose current values, including optimistic edits, supply the field. */
    transaction: Transaction;

    /** Parent expense report supplying report-level values and the conversion currency. */
    report: OnyxEntry<Report>;

    /** Workspace supplying tax configuration and the fallback conversion currency. */
    policy: OnyxEntry<Policy>;

    /** Workspace categories used to resolve the expense's category GL code. */
    policyCategories: OnyxEntry<PolicyCategories>;

    /** Workspace tag lists used to resolve GL codes in tag order. */
    policyTagLists: OnyxEntry<PolicyTagLists>;
};

function MoneyRequestViewAdditionalField({column, transaction, report, policy, policyCategories, policyTagLists}: MoneyRequestViewAdditionalFieldProps) {
    const {translate} = useLocalize();
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
        <MenuItemField
            name={translate(getSearchColumnTranslationKey(column))}
            value={value ?? ''}
            isValueSelectable={!!value}
            numberOfLinesValue={2}
        >
            {!!value && <MenuItem.Copy value={value} />}
        </MenuItemField>
    );
}

export default MoneyRequestViewAdditionalField;
