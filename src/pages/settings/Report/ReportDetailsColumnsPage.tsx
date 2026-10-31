import ColumnsSettingsList from '@components/ColumnsSettingsList';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import type {SearchCustomColumnIds} from '@components/Search/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportTransactions from '@hooks/useReportTransactions';

import {setReportDetailsColumns} from '@libs/actions/ReportLayout';
import getMoneyRequestViewFields from '@libs/getMoneyRequestViewFields';
import {isBillableEnabledOnPolicy} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasVendorFeature, isPolicyTaxEnabled} from '@libs/PolicyUtils';
import {isIOUReport} from '@libs/ReportUtils';
import {getColumnsToShow, isReportDetailsCustomColumn} from '@libs/SearchUIUtils';
import {hasNonReimbursableTransactions} from '@libs/TransactionUtils';

import type {ReportSettingsNavigatorParamList} from '@navigation/types';

import {setNameValuePair} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx/DerivedValues';
import arraysEqual from '@src/utils/arraysEqual';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

// Reset restores the report table's default columns.
const REPORT_DETAILS_DEFAULT_COLUMNS: SearchCustomColumnIds[] = [
    CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];

const ALL_REPORT_DETAILS_CUSTOM_COLUMNS = Object.values(CONST.SEARCH.REPORT_DETAILS_CUSTOM_COLUMNS).filter(isReportDetailsCustomColumn);
const EXPENSE_DEFAULT_FIELDS = getMoneyRequestViewFields().filter(isReportDetailsCustomColumn);
const ALL_EXPENSE_FIELDS = getMoneyRequestViewFields(ALL_REPORT_DETAILS_CUSTOM_COLUMNS).filter(isReportDetailsCustomColumn);

const reportTransactionsReadySelector = (value: ReportTransactionsAndViolationsDerivedValue | undefined) => value !== undefined;

function ReportDetailsColumnsPage() {
    const route = useRoute<PlatformStackRouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.COLUMNS | typeof SCREENS.REPORT_SETTINGS.FIELDS>>();
    const reportID = route.params.reportID;
    const isExpenseView = route.name === SCREENS.REPORT_SETTINGS.FIELDS;
    const [reportDetailsColumns] = useOnyx(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS);
    const [expenseFields] = useOnyx(ONYXKEYS.NVP_EXPENSE_FIELDS);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const reportTransactions = useReportTransactions(reportID);
    // The transaction hook returns an empty array before initialization as well as for an empty report.
    const [areReportTransactionsReady] = useOnyx(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, {selector: reportTransactionsReadySelector});
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);

    // The vendor column only exists for workspaces with the vendor feature, so hide it when this report's workspace lacks it.
    const isVendorColumnAvailable = hasVendorFeature(policy, isVendorMatchingBetaEnabled ?? false);
    const isVendorAvailabilityLoading = isVendorMatchingBetaEnabled === undefined && !isVendorColumnAvailable && hasVendorFeature(policy, true);
    const isColumnAvailable = (column: SearchCustomColumnIds) =>
        (!isExpenseView || column !== CONST.SEARCH.TABLE_COLUMNS.RECEIPT) && (isVendorColumnAvailable || column !== CONST.SEARCH.TABLE_COLUMNS.VENDOR);

    const rawSavedColumns = (reportDetailsColumns ?? []).filter(isReportDetailsCustomColumn);
    const savedColumns = rawSavedColumns.filter((column) => isVendorColumnAvailable || column !== CONST.SEARCH.TABLE_COLUMNS.VENDOR);
    const isLoading = isVendorAvailabilityLoading || (!isExpenseView && !savedColumns.length && !areReportTransactionsReady);
    let tableColumns = savedColumns;
    if (!isExpenseView && !tableColumns.length) {
        tableColumns = reportTransactions?.length
            ? getColumnsToShow({
                  currentAccountID: currentUserDetails?.accountID,
                  data: reportTransactions,
                  report,
                  isExpenseReportView: true,
                  isExpenseReportViewFromIOUReport: isIOUReport(report),
                  shouldShowBillableColumn: isBillableEnabledOnPolicy(policy),
                  shouldShowReimbursableColumn: hasNonReimbursableTransactions(reportTransactions),
                  reportCurrency: report?.currency,
                  isPolicyTaxEnabled: isPolicyTaxEnabled(policy),
                  isVendorColumnAvailable,
              }).filter(isReportDetailsCustomColumn)
            : REPORT_DETAILS_DEFAULT_COLUMNS;
    }
    const effectiveColumns = isExpenseView ? getMoneyRequestViewFields(savedColumns, expenseFields).filter(isReportDetailsCustomColumn) : tableColumns;

    const allColumns = (isExpenseView ? ALL_EXPENSE_FIELDS : ALL_REPORT_DETAILS_CUSTOM_COLUMNS).filter(isColumnAvailable);
    const currentColumns = effectiveColumns.filter(isColumnAvailable);
    const requiredColumns = new Set<SearchCustomColumnIds>([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);

    const saveColumns = async (selectedColumnIds: SearchCustomColumnIds[]) => {
        if (isLoading) {
            return;
        }

        // Skip saving if columns haven't changed from the effective state, to avoid
        // switching from the default path to the custom path in getColumnsToShow unnecessarily.
        if (!arraysEqual(selectedColumnIds, currentColumns)) {
            // This read waits for Onyx initialization and protects preferences that changed since the picker rendered.
            const [latestTableColumns, latestExpenseFields] = await Onyx.multiGet([ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS, ONYXKEYS.NVP_EXPENSE_FIELDS]);
            if (!arraysEqual(latestTableColumns ?? [], reportDetailsColumns ?? []) || (isExpenseView && (latestExpenseFields ?? '') !== (expenseFields ?? ''))) {
                return;
            }

            if (isExpenseView) {
                const fieldsToSave = [...selectedColumnIds];
                // Workspace availability must not erase a field selected for other workspaces.
                for (const [index, column] of effectiveColumns.entries()) {
                    if (!isColumnAvailable(column)) {
                        fieldsToSave.splice(Math.min(index, fieldsToSave.length), 0, column);
                    }
                }
                setNameValuePair(ONYXKEYS.NVP_EXPENSE_FIELDS, JSON.stringify(fieldsToSave), latestExpenseFields ?? '');
            } else {
                setReportDetailsColumns(selectedColumnIds, latestTableColumns);
            }
        }
        Navigation.goBack();
    };

    if (isLoading) {
        return <FullscreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <ColumnsSettingsList
            // The picker snapshots both selected and unselected fields when it mounts.
            key={JSON.stringify([allColumns, currentColumns])}
            titleKey={isExpenseView ? 'search.customizeFields' : 'search.columns'}
            allColumns={allColumns}
            defaultSelectedColumns={isExpenseView ? EXPENSE_DEFAULT_FIELDS : REPORT_DETAILS_DEFAULT_COLUMNS}
            currentColumns={currentColumns}
            requiredColumns={requiredColumns}
            onSave={saveColumns}
        />
    );
}

ReportDetailsColumnsPage.displayName = 'ReportDetailsColumnsPage';

export default ReportDetailsColumnsPage;
