import React, {useCallback, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import type {SearchColumnType, SearchGroupBy, SortOrder} from '@components/Search/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import SortableTableHeader from './SortableTableHeader';
import type {SortableColumnName} from './types';

type SearchColumnConfig = {
    columnName: SearchColumnType;
    translationKey: TranslationPaths | undefined;
    icon?: IconAsset;
    isColumnSortable?: boolean;
};

type SearchHeaderIcons = {
    Profile?: IconAsset;
    CreditCard?: IconAsset;
    Bank?: IconAsset;
    Receipt?: IconAsset;
};

const getExpenseHeaders = (groupBy?: SearchGroupBy): SearchColumnConfig[] => [
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
        translationKey: 'common.receipt',
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TYPE,
        translationKey: 'common.type',
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DATE,
        translationKey: 'common.date',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.POSTED,
        translationKey: 'search.filters.posted',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.EXPORTED,
        translationKey: 'search.filters.exported',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.SUBMITTED,
        translationKey: 'common.submitted',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.APPROVED,
        translationKey: 'search.filters.approved',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
        translationKey: 'common.merchant',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
        translationKey: 'common.description',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.FROM,
        translationKey: 'common.from',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TO,
        translationKey: 'common.to',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME,
        translationKey: 'workspace.common.workspace',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.CARD,
        translationKey: 'common.card',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
        translationKey: 'common.category',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAG,
        translationKey: 'common.tag',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE,
        translationKey: 'common.reimbursable',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.BILLABLE,
        translationKey: 'common.billable',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAX_RATE,
        translationKey: 'iou.taxRate',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT,
        translationKey: 'common.tax',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE,
        translationKey: 'common.exchangeRate',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT,
        translationKey: 'common.originalAmount',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID,
        translationKey: 'common.withdrawalID',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        translationKey: groupBy ? 'common.total' : 'iou.amount',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID,
        translationKey: 'common.reportID',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.REPORT_ID,
        translationKey: 'common.longReportID',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TITLE,
        translationKey: 'common.title',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.STATUS,
        translationKey: 'common.status',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO,
        translationKey: 'search.exportedTo',
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ACTION,
        translationKey: 'common.action',
        isColumnSortable: false,
    },
];

const taskHeaders: SearchColumnConfig[] = [
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DATE,
        translationKey: 'common.date',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TITLE,
        translationKey: 'common.title',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
        translationKey: 'common.description',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.FROM,
        translationKey: 'common.from',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.IN,
        translationKey: 'common.sharedIn',
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ASSIGNEE,
        translationKey: 'common.assignee',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO,
        translationKey: 'search.exportedTo',
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ACTION,
        translationKey: 'common.action',
        isColumnSortable: false,
    },
];

const getExpenseReportHeaders = (profileIcon?: IconAsset): SearchColumnConfig[] => [
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.AVATAR,
        translationKey: undefined,
        icon: profileIcon,
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DATE,
        translationKey: 'common.date',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.SUBMITTED,
        translationKey: 'common.submitted',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.APPROVED,
        translationKey: 'search.filters.approved',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.EXPORTED,
        translationKey: 'search.filters.exported',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.STATUS,
        translationKey: 'common.status',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TITLE,
        translationKey: 'common.title',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.FROM,
        translationKey: 'common.from',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TO,
        translationKey: 'common.to',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME,
        translationKey: 'workspace.common.workspace',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE_TOTAL,
        translationKey: 'common.reimbursableTotal',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL,
        translationKey: 'common.nonReimbursableTotal',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TOTAL,
        translationKey: 'common.total',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID,
        translationKey: 'common.reportID',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.REPORT_ID,
        translationKey: 'common.longReportID',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO,
        translationKey: 'search.exportedTo',
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ACTION,
        translationKey: 'common.action',
        isColumnSortable: false,
    },
];

const getTransactionGroupHeaders = (groupBy: SearchGroupBy, icons: SearchHeaderIcons): SearchColumnConfig[] => {
    switch (groupBy) {
        case CONST.SEARCH.GROUP_BY.FROM:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.AVATAR,
                    translationKey: undefined,
                    icon: icons.Profile,
                    isColumnSortable: false,
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM,
                    translationKey: 'common.from',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                    translationKey: 'common.expenses',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                    translationKey: 'common.total',
                },
            ];
        case CONST.SEARCH.GROUP_BY.CARD:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.AVATAR,
                    translationKey: undefined,
                    icon: icons.CreditCard,
                    isColumnSortable: false,
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD,
                    translationKey: 'common.card',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_FEED,
                    translationKey: 'search.filters.feed',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                    translationKey: 'common.expenses',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                    translationKey: 'common.total',
                },
            ];
        case CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.AVATAR,
                    translationKey: undefined,
                    icon: icons.Bank,
                    isColumnSortable: false,
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_BANK_ACCOUNT,
                    translationKey: 'common.bankAccount',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
                    translationKey: 'search.filters.withdrawn',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
                    translationKey: 'common.withdrawalID',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                    translationKey: 'common.expenses',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                    translationKey: 'common.total',
                },
            ];
        case CONST.SEARCH.GROUP_BY.MERCHANT:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.AVATAR,
                    translationKey: undefined,
                    icon: icons.Receipt,
                    isColumnSortable: false,
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT,
                    translationKey: 'common.merchant',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
                    translationKey: 'common.expenses',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                    translationKey: 'common.total',
                },
            ];
        default:
            return [];
    }
};

function getSearchColumns(type: ValueOf<typeof CONST.SEARCH.DATA_TYPES>, icons: SearchHeaderIcons, groupBy?: SearchGroupBy, isExpenseReportView?: boolean): SearchColumnConfig[] | null {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
            if (!isExpenseReportView && groupBy) {
                return getTransactionGroupHeaders(groupBy, icons);
            }
            return getExpenseHeaders(groupBy);
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return getExpenseHeaders(groupBy);
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return getExpenseHeaders(groupBy);
        case CONST.SEARCH.DATA_TYPES.TASK:
            return taskHeaders;
        case CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT:
            return getExpenseReportHeaders(icons.Profile);
        case CONST.SEARCH.DATA_TYPES.CHAT:
        default:
            return null;
    }
}

type SearchTableHeaderProps = {
    columns: SortableColumnName[];
    type: SearchDataTypes;
    sortBy?: SearchColumnType;
    sortOrder?: SortOrder;
    onSortPress: (column: SearchColumnType, order: SortOrder) => void;
    shouldShowYear: boolean;
    shouldShowYearSubmitted?: boolean;
    shouldShowYearApproved?: boolean;
    shouldShowYearPosted?: boolean;
    shouldShowYearExported?: boolean;
    isAmountColumnWide: boolean;
    isTaxAmountColumnWide: boolean;
    shouldShowSorting: boolean;
    canSelectMultiple: boolean;
    groupBy: SearchGroupBy | undefined;

    /** True when we are inside an expense report view, false if we're in the Reports page. */
    isExpenseReportView?: boolean;
};

function SearchTableHeader({
    columns,
    type,
    sortBy,
    sortOrder,
    onSortPress,
    shouldShowYear,
    shouldShowYearSubmitted,
    shouldShowYearApproved,
    shouldShowYearPosted,
    shouldShowYearExported,
    shouldShowSorting,
    canSelectMultiple,
    isAmountColumnWide,
    isTaxAmountColumnWide,
    groupBy,
    isExpenseReportView,
}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;

    // Convert MERCHANT sortBy to GROUP_MERCHANT for merchant grouping so the sort arrow appears on the correct column
    const displaySortBy = groupBy === CONST.SEARCH.GROUP_BY.MERCHANT && sortBy === CONST.SEARCH.TABLE_COLUMNS.MERCHANT ? CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT : sortBy;

    // Only load Profile icon when it's needed for EXPENSE_REPORT type or grouped transactions
    const icons = useMemoizedLazyExpensifyIcons(type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT || !!groupBy ? ['Profile', 'Bank', 'CreditCard', 'Receipt'] : []) satisfies SearchHeaderIcons;

    const shouldShowColumn = useCallback(
        (columnName: SortableColumnName) => {
            return columns.includes(columnName);
        },
        [columns],
    );

    const columnConfig = useMemo(() => getSearchColumns(type, icons, groupBy, isExpenseReportView), [type, groupBy, icons, isExpenseReportView]);

    const orderedColumnConfig = useMemo(() => {
        if (!columnConfig) {
            return null;
        }

        const configMap = new Map(columnConfig.map((config) => [config.columnName, config]));

        // Users can customize column order via the Search Columns page.
        // We respect their preferred order by placing user-selected columns first,
        // then appending any remaining columns (which will be filtered out by shouldShowColumn).
        const orderedConfig: SearchColumnConfig[] = [];
        const addedColumns = new Set<SearchColumnType>();

        for (const col of columns) {
            const config = configMap.get(col);
            if (config) {
                orderedConfig.push(config);
                addedColumns.add(col);
            }
        }

        for (const config of columnConfig) {
            if (!addedColumns.has(config.columnName)) {
                orderedConfig.push(config);
            }
        }

        return orderedConfig;
    }, [columnConfig, columns]);

    if (displayNarrowVersion) {
        return;
    }

    if (!orderedColumnConfig) {
        return;
    }

    return (
        <SortableTableHeader
            columns={orderedColumnConfig}
            shouldShowColumn={shouldShowColumn}
            dateColumnSize={shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            submittedColumnSize={shouldShowYearSubmitted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            approvedColumnSize={shouldShowYearApproved ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            postedColumnSize={shouldShowYearPosted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            exportedColumnSize={shouldShowYearExported ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            amountColumnSize={isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            taxAmountColumnSize={isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            shouldShowSorting={shouldShowSorting}
            sortBy={displaySortBy}
            sortOrder={sortOrder}
            // In GroupBy views, disable flex expansion for Total columns so Expenses column gets more space
            shouldRemoveTotalColumnFlex={!!groupBy && !isExpenseReportView}
            // Don't butt up against the 'select all' checkbox if present
            containerStyles={canSelectMultiple && [styles.pl4]}
            onSortPress={(columnName, order) => {
                if (columnName === CONST.SEARCH.TABLE_COLUMNS.COMMENTS) {
                    return;
                }
                // Convert GROUP_MERCHANT to MERCHANT for sorting to avoid crashes
                const sortColumn = columnName === CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT ? CONST.SEARCH.TABLE_COLUMNS.MERCHANT : columnName;
                onSortPress(sortColumn, order);
            }}
        />
    );
}

export {getExpenseHeaders};
export default SearchTableHeader;
