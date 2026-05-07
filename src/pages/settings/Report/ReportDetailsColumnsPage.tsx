import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
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
import type {Transaction} from '@src/types/onyx';
import arraysEqual from '@src/utils/arraysEqual';

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
    CONST.SEARCH.TABLE_COLUMNS.TOTAL,
];

function ReportDetailsColumnsPage() {
    const route = useRoute<PlatformStackRouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.COLUMNS>>();
    const reportID = route.params.reportID;
    const [reportDetailsColumns] = useOnyx(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    // Selector keeps re-renders scoped to this report's transactions. We intentionally return undefined
    // while the collection is loading so the caller can distinguish "loading" from "no transactions".
    const reportTransactionsSelector = useCallback(
        (transactions: OnyxCollection<Transaction>): Transaction[] | undefined => {
            if (!transactions) {
                return undefined;
            }
            return Object.values(transactions).filter((transaction): transaction is Transaction => !!transaction && transaction.reportID === reportID);
        },
        [reportID],
    );
    const [reportTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: reportTransactionsSelector}, [reportTransactionsSelector]);
    const currentUserDetails = useCurrentUserPersonalDetails();

    const allTypeCustomColumns = Object.values(CONST.SEARCH.REPORT_DETAILS_CUSTOM_COLUMNS) as SearchCustomColumnIds[];

    // Wait for transactions to load before rendering. ColumnsSettingsList snapshots
    // currentColumns in useState on mount and does not sync prop updates, so we must
    // pass the final value on first render.
    const isLoading = !reportTransactions;

    // When no custom columns are saved, compute which columns getColumnsToShow would
    // return for this report so data-driven columns (e.g. Exchange rate, Original amount,
    // Tax rate, Tax amount) appear pre-selected when they have data on the table.
    const effectiveColumns = useMemo(() => {
        const savedColumns = (reportDetailsColumns ?? []) as SearchCustomColumnIds[];
        if (savedColumns.length > 0) {
            return savedColumns;
        }

        if (!reportTransactions?.length) {
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

        // Filter to only columns available in the custom columns list (drops RECEIPT/TYPE/COMMENTS etc.)
        return visibleColumns.filter((col) => allTypeCustomColumns.includes(col as SearchCustomColumnIds)) as SearchCustomColumnIds[];
    }, [reportDetailsColumns, reportTransactions, currentUserDetails?.accountID, report, policy, allTypeCustomColumns]);

    const requiredColumns = new Set<SearchCustomColumnIds>([CONST.SEARCH.TABLE_COLUMNS.TOTAL]);

    const handleSave = (selectedColumnIds: SearchCustomColumnIds[]) => {
        // Skip saving if columns haven't changed from the effective state, to avoid
        // switching from the default path to the custom path in getColumnsToShow unnecessarily.
        if (!arraysEqual(selectedColumnIds, effectiveColumns)) {
            setReportDetailsColumns(selectedColumnIds, reportDetailsColumns);
        }
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
