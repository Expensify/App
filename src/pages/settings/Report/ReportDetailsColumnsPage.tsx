import ColumnsSettingsList from '@components/ColumnsSettingsList';
import type {SearchCustomColumnIds} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {setReportDetailsColumns} from '@libs/actions/ReportLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getReportDetailsColumns from '@libs/getReportDetailsColumns';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasVendorFeature} from '@libs/PolicyUtils';
import {getRequiredReportDetailsColumns, isReportDetailsCustomColumn} from '@libs/SearchUIUtils';

import type {ReportSettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import arraysEqual from '@src/utils/arraysEqual';

import type {OnyxCollection} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';
import React from 'react';

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

const ALL_REPORT_DETAILS_CUSTOM_COLUMNS = Object.values(CONST.SEARCH.REPORT_DETAILS_CUSTOM_COLUMNS).filter(isReportDetailsCustomColumn);

function ReportDetailsColumnsPage() {
    const route = useRoute<PlatformStackRouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.COLUMNS>>();
    const reportID = route.params.reportID;
    const isCustomizeFields = route.params.isCustomizeFields;
    const policyID = route.params.policyID ?? undefined;
    const [reportDetailsColumns] = useOnyx(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const effectivePolicyID = policyID ?? report?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(effectivePolicyID)}`);
    // Selector keeps re-renders scoped to this report's transactions. We intentionally return undefined
    // while the collection is loading so the caller can distinguish "loading" from "no transactions".
    const [reportTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (transactions: OnyxCollection<Transaction>): Transaction[] | undefined => {
            if (!transactions) {
                return undefined;
            }
            return Object.values(transactions).filter(
                (transaction): transaction is Transaction =>
                    !!transaction && (transaction.reportID === reportID || (!!isCustomizeFields && !!route.params.transactionID && transaction.transactionID === route.params.transactionID)),
            );
        },
    });
    const {isBetaEnabled} = usePermissions();
    const {translate} = useLocalize();

    // The vendor column only exists for workspaces with the vendor feature, so hide it when this report's workspace lacks it.
    const isVendorColumnAvailable = hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING));
    const isColumnAvailable = (column: SearchCustomColumnIds) => isVendorColumnAvailable || column !== CONST.SEARCH.TABLE_COLUMNS.VENDOR;

    // Wait for transactions to load before rendering. ColumnsSettingsList snapshots
    // currentColumns in useState on mount and does not sync prop updates, so we must
    // pass the final value on first render.
    const isLoading = !reportTransactions || (!!policyID && !policy);

    // When no custom columns are saved, compute which columns getColumnsToShow would
    // return for this report so data-driven columns (e.g. Exchange rate, Original amount,
    // Tax rate, Tax amount) appear pre-selected when they have data on the table.
    let effectiveColumns;
    const savedColumns = (reportDetailsColumns ?? []).filter(isReportDetailsCustomColumn);
    if (savedColumns.length > 0) {
        effectiveColumns = savedColumns;
    } else if (!reportTransactions?.length) {
        effectiveColumns = REPORT_DETAILS_DEFAULT_COLUMNS;
    } else {
        const visibleColumns = getReportDetailsColumns({
            transactions: reportTransactions,
            report,
            policy,
            isVendorColumnAvailable,
            shouldUseWorkspaceColumnPreferences: !!policyID,
            fallbackPolicyID: policyID,
        });

        // Filter to only columns available in the custom columns list (drops RECEIPT/TYPE/COMMENTS etc.)
        effectiveColumns = visibleColumns.filter(isReportDetailsCustomColumn);
    }

    const allColumns: SearchCustomColumnIds[] = ALL_REPORT_DETAILS_CUSTOM_COLUMNS.filter(
        (column) => isColumnAvailable(column) && (!isCustomizeFields || column !== CONST.SEARCH.TABLE_COLUMNS.RECEIPT),
    );
    const currentColumns = effectiveColumns.filter((column) => isColumnAvailable(column) && allColumns.includes(column));
    const requiredColumns = isCustomizeFields
        ? new Set<SearchCustomColumnIds>([CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT])
        : getRequiredReportDetailsColumns();

    const handleSave = (selectedColumnIds: SearchCustomColumnIds[]) => {
        const normalizedSelectedColumnIds = isCustomizeFields ? selectedColumnIds.filter((column) => !requiredColumns.has(column) || currentColumns.includes(column)) : selectedColumnIds;
        // Skip saving if columns haven't changed from the effective state, to avoid
        // switching from the default path to the custom path in getColumnsToShow unnecessarily.
        if (!arraysEqual(normalizedSelectedColumnIds, currentColumns)) {
            // Receipt is hidden in this picker, but its saved selection and position still control the report table.
            const hasSavedColumns = savedColumns.length > 0;
            const shouldShowReceiptColumn = hasSavedColumns
                ? reportDetailsColumns?.includes(CONST.SEARCH.TABLE_COLUMNS.RECEIPT)
                : REPORT_DETAILS_DEFAULT_COLUMNS.includes(CONST.SEARCH.TABLE_COLUMNS.RECEIPT);
            // Required fields stay visible in expense details, but they must not be added to the shared table preference unless they were already selected there.
            const columnsToSave = [...normalizedSelectedColumnIds];
            // Keep columns hidden from this picker in their saved relative order, including Receipt and fields unavailable in this workspace.
            if (isCustomizeFields) {
                let columnsToPreserve: SearchCustomColumnIds[];
                if (hasSavedColumns) {
                    columnsToPreserve = (reportDetailsColumns ?? []).filter(
                        (column): column is SearchCustomColumnIds => isReportDetailsCustomColumn(column) || (!!shouldShowReceiptColumn && column === CONST.SEARCH.TABLE_COLUMNS.RECEIPT),
                    );
                } else {
                    columnsToPreserve = shouldShowReceiptColumn ? REPORT_DETAILS_DEFAULT_COLUMNS : [];
                }
                for (const [index, column] of columnsToPreserve.entries()) {
                    if (column !== CONST.SEARCH.TABLE_COLUMNS.RECEIPT && allColumns.includes(column)) {
                        continue;
                    }

                    const previousSavedColumn = columnsToPreserve
                        .slice(0, index)
                        .reverse()
                        .find((savedColumn) => columnsToSave.includes(savedColumn));
                    if (previousSavedColumn) {
                        columnsToSave.splice(columnsToSave.indexOf(previousSavedColumn) + 1, 0, column);
                        continue;
                    }

                    const nextSavedColumn = columnsToPreserve.slice(index + 1).find((savedColumn) => columnsToSave.includes(savedColumn));
                    const insertionIndex = nextSavedColumn ? columnsToSave.indexOf(nextSavedColumn) : columnsToSave.length;
                    columnsToSave.splice(insertionIndex, 0, column);
                }
            }
            setReportDetailsColumns(columnsToSave, reportDetailsColumns);
        }
        Navigation.goBack();
    };

    if (isLoading) {
        return null;
    }

    return (
        <ColumnsSettingsList
            title={isCustomizeFields ? translate('iou.customizeFields') : undefined}
            allColumns={allColumns}
            defaultSelectedColumns={REPORT_DETAILS_DEFAULT_COLUMNS}
            currentColumns={currentColumns}
            requiredColumns={requiredColumns}
            onSave={handleSave}
        />
    );
}

ReportDetailsColumnsPage.displayName = 'ReportDetailsColumnsPage';

export default ReportDetailsColumnsPage;
