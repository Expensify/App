/** Shows the report's configured extra columns in both expense detail views. */
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import {getMoneyRequestReportTransactions} from '@components/MoneyRequestReportView/useMoneyRequestReportData';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';

import type {MoneyRequestAdditionalField} from '@libs/getMoneyRequestAdditionalFields';
import getMoneyRequestAdditionalFields from '@libs/getMoneyRequestAdditionalFields';
import getReportDetailsColumns, {getConfiguredReportDetailsColumns} from '@libs/getReportDetailsColumns';
import {getSearchColumnTranslationKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report, ReportActions, Transaction} from '@src/types/onyx';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';

type MoneyRequestViewAdditionalFieldsProps = {
    transaction: Transaction;
    report: Report;
    reportActions: ReportActions | undefined;
    policy: Policy | undefined;
    policyCategories: PolicyCategories | undefined;
    policyTags: PolicyTagLists | undefined;
    visibleAttendeeCount: number;
    isVendorColumnAvailable: boolean;
};

const additionalFieldLabels = CONST.SENTRY_LABEL.MONEY_REQUEST_VIEW.ADDITIONAL_FIELD;
const sentryLabelByColumn: Record<MoneyRequestAdditionalField['column'], SentryLabel> = {
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE]: additionalFieldLabels.CATEGORY_GL_CODE,
    [CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE]: additionalFieldLabels.TAG_GL_CODE,
    [CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE]: additionalFieldLabels.EXCHANGE_RATE,
    [CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT]: additionalFieldLabels.ORIGINAL_AMOUNT,
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL]: additionalFieldLabels.TOTAL,
    [CONST.SEARCH.TABLE_COLUMNS.POSTED]: additionalFieldLabels.POSTED,
    [CONST.SEARCH.TABLE_COLUMNS.MCC]: additionalFieldLabels.MCC,
    [CONST.SEARCH.TABLE_COLUMNS.TAX_CODE]: additionalFieldLabels.TAX_CODE,
    [CONST.SEARCH.TABLE_COLUMNS.HELD]: additionalFieldLabels.HELD,
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE]: additionalFieldLabels.TOTAL_PER_ATTENDEE,
    [CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID]: additionalFieldLabels.WITHDRAWAL_ID,
    [CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_USER_ID]: additionalFieldLabels.SUBMITTER_USER_ID,
    [CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID]: additionalFieldLabels.SUBMITTER_PAYROLL_ID,
    [CONST.SEARCH.TABLE_COLUMNS.ORDER_DEAL_NUMBERS]: additionalFieldLabels.ORDER_DEAL_NUMBERS,
};

function MoneyRequestViewAdditionalFields({
    transaction,
    report,
    reportActions,
    policy,
    policyCategories,
    policyTags,
    visibleAttendeeCount,
    isVendorColumnAvailable,
}: MoneyRequestViewAdditionalFieldsProps) {
    const [savedColumns] = useOnyx(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS);
    const {translate, dateFnsLocale} = useLocalize();
    const {isOffline} = useNetwork();
    const {convertToDisplayString} = useCurrencyListActions();

    const configuredColumns = getConfiguredReportDetailsColumns(savedColumns, isVendorColumnAvailable);
    // The other expenses can affect the table's default columns. A saved selection only needs this expense.
    const reportTransactions = useReportTransactionsCollection(configuredColumns.length ? undefined : report.reportID);
    const transactions = configuredColumns.length ? [transaction] : getMoneyRequestReportTransactions(reportTransactions, Object.values(reportActions ?? {}), isOffline).transactions;
    const columns = getReportDetailsColumns({report, policy, transactions: transactions.length ? transactions : [transaction], columns: configuredColumns, isVendorColumnAvailable});
    const fields = getMoneyRequestAdditionalFields({
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
    });

    return fields.map(({column, value}) => (
        <MenuItemField
            key={column}
            name={translate(getSearchColumnTranslationKey(column))}
            value={value}
            numberOfLinesValue={0}
            isValueSelectable
            sentryLabel={sentryLabelByColumn[column]}
        />
    ));
}

export default MoneyRequestViewAdditionalFields;
