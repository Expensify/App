import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import ColumnsSettingsList from '@components/ColumnsSettingsList';
import type {SearchCustomColumnIds} from '@components/Search/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {setReportDetailsColumns} from '@libs/actions/ReportLayout';
import {hasNonReimbursableTransactions, isBillableEnabledOnPolicy} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {isIOUReport} from '@libs/ReportUtils';
import {getColumnsToShow} from '@libs/SearchUIUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

/**
 * Default selected columns for the report details table.
 * These match what MoneyRequestReportTransactionList shows by default
 * (the always-true columns from getColumnsToShow when isExpenseReportView=true).
 */
const REPORT_DETAILS_DEFAULT_COLUMNS: SearchCustomColumnIds[] = [
    CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];

function ReportDetailsColumnsPage() {
    const route = useRoute<PlatformStackRouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.COLUMNS>>();
    const reportID = route.params.reportID;
    const [reportDetailsColumns] = useOnyx(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const reportTransactions = Object.values(allTransactions ?? {}).filter((t): t is NonNullable<typeof t> => t != null && t.reportID === reportID);
    const currentUserDetails = useCurrentUserPersonalDetails();

    const allTypeCustomColumns = Object.values(CONST.SEARCH.REPORT_DETAILS_CUSTOM_COLUMNS) as SearchCustomColumnIds[];

    // When no custom columns are saved, compute which columns getColumnsToShow would display
    // so the Columns page checkboxes reflect what the user actually sees on the report.
    // Wait for transactions to load before computing effective columns.
    // ColumnsSettingsList snapshots currentColumns in useState on mount,
    // so we must not render it until we have the final value.
    const isLoading = !allTransactions;

    const effectiveColumns = useMemo(() => {
        const savedColumns = (reportDetailsColumns ?? []) as SearchCustomColumnIds[];
        if (savedColumns.length > 0) {
            return savedColumns;
        }

        if (!reportTransactions.length) {
            return REPORT_DETAILS_DEFAULT_COLUMNS;
        }

        const visibleColumns = getColumnsToShow({
            currentAccountID: currentUserDetails?.accountID,
            data: reportTransactions,
            isExpenseReportView: true,
            isExpenseReportViewFromIOUReport: isIOUReport(report),
            shouldShowBillableColumn: isBillableEnabledOnPolicy(policy),
            shouldShowReimbursableColumn: hasNonReimbursableTransactions(reportTransactions),
            reportCurrency: report?.currency,
        });

        // Filter to only columns that are available in the custom columns list
        return visibleColumns.filter((col) => allTypeCustomColumns.includes(col as SearchCustomColumnIds)) as SearchCustomColumnIds[];
    }, [reportDetailsColumns, reportTransactions, currentUserDetails?.accountID, report, policy, allTypeCustomColumns]);

    const requiredColumns = new Set<SearchCustomColumnIds>([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);

    const handleSave = (selectedColumnIds: SearchCustomColumnIds[]) => {
        setReportDetailsColumns(selectedColumnIds, reportDetailsColumns);
        Navigation.goBack();
    };

    if (isLoading) {
        return null;
    }

    return (
        <ColumnsSettingsList
            allColumns={allTypeCustomColumns}
            defaultSelectedColumns={REPORT_DETAILS_DEFAULT_COLUMNS}
            currentColumns={effectiveColumns}
            requiredColumns={requiredColumns}
            onSave={handleSave}
        />
    );
}

ReportDetailsColumnsPage.displayName = 'ReportDetailsColumnsPage';

export default ReportDetailsColumnsPage;
