import ColumnsSettingsList from '@components/ColumnsSettingsList';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import type {SearchCustomColumnIds} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {setReportDetailsColumns} from '@libs/actions/ReportLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getReportDetailsColumns, {getConfiguredReportDetailsColumns} from '@libs/getReportDetailsColumns';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasVendorFeature} from '@libs/PolicyUtils';
import {isReportDetailsCustomColumn} from '@libs/SearchUIUtils';

import type {ReportSettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import arraysEqual from '@src/utils/arraysEqual';

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
const REQUIRED_REPORT_COLUMNS = new Set<SearchCustomColumnIds>([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]);

function ReportDetailsColumnsPage() {
    const route = useRoute<PlatformStackRouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.COLUMNS>>();
    const {reportID} = route.params;
    const isExpenseView = route.params.isExpenseView === 'true';
    const {translate} = useLocalize();
    const [reportDetailsColumns] = useOnyx(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const {isBetaEnabled} = usePermissions();
    const hasSavedSelection = reportDetailsColumns?.some(isReportDetailsCustomColumn);
    const [reportTransactions] = useOnyx(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, {
        selector: (transactionsByReport) => {
            if (hasSavedSelection || !transactionsByReport) {
                return undefined;
            }
            return transactionsByReport[reportID]?.transactions ?? getEmptyObject<Record<string, Transaction>>();
        },
    });

    // The vendor column only exists for workspaces with the vendor feature, so hide it when this report's workspace lacks it.
    const isVendorColumnAvailable = hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING));
    const isColumnAvailable = (column: SearchCustomColumnIds) => isVendorColumnAvailable || column !== CONST.SEARCH.TABLE_COLUMNS.VENDOR;

    // Wait for the report's transactions before showing data-driven defaults.
    if (!hasSavedSelection && !reportTransactions) {
        return <FullscreenLoadingIndicator shouldUseGoBackButton />;
    }

    let effectiveColumns = getConfiguredReportDetailsColumns(reportDetailsColumns, true);
    if (!hasSavedSelection) {
        const transactions = Object.values(reportTransactions ?? {});
        effectiveColumns = transactions.length
            ? getReportDetailsColumns({transactions, report, policy, isVendorColumnAvailable}).filter(isReportDetailsCustomColumn)
            : REPORT_DETAILS_DEFAULT_COLUMNS;
    }

    const currentColumns = effectiveColumns.filter(isColumnAvailable);

    const saveColumns = (selectedColumnIds: SearchCustomColumnIds[]) => {
        // An unchanged selection should keep the table's data-driven defaults active.
        if (!arraysEqual(selectedColumnIds, currentColumns)) {
            setReportDetailsColumns(selectedColumnIds, reportDetailsColumns);
        }
        Navigation.goBack();
    };

    return (
        <ColumnsSettingsList
            title={isExpenseView ? translate('iou.customizeFields') : undefined}
            resetText={isExpenseView ? translate('search.resetFields') : undefined}
            allColumns={ALL_REPORT_DETAILS_CUSTOM_COLUMNS.filter(isColumnAvailable)}
            defaultSelectedColumns={REPORT_DETAILS_DEFAULT_COLUMNS}
            currentColumns={currentColumns}
            requiredColumns={REQUIRED_REPORT_COLUMNS}
            onSave={saveColumns}
        />
    );
}

ReportDetailsColumnsPage.displayName = 'ReportDetailsColumnsPage';

export default ReportDetailsColumnsPage;
