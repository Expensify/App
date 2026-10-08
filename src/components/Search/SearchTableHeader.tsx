import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import Navigation from '@libs/Navigation/Navigation';
import {isCreatedDateType} from '@libs/SearchUIUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ValueOf} from 'type-fest';

import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

import type {HeaderCellFrame} from './SortableHeaderText';
import type {SearchColumnType, SearchGroupBy, SearchSortBy, SortOrder} from './types';

import {isAnchoredLeftColumn, PIN_SIDE, useFrozenColumnActions, useFrozenColumnState} from './FrozenColumnContext';
import SortableTableHeader from './SortableTableHeader';

type SearchColumnConfig = {
    columnName: SearchColumnType;
    translationKey: TranslationPaths | undefined;
    icon?: IconAsset;
    isColumnSortable?: boolean;
    sortColumnName?: SearchSortBy;
    canEdit?: boolean;
};

type SearchHeaderIcons = {
    Profile?: IconAsset;
    CreditCard?: IconAsset;
    Bank?: IconAsset;
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
        canEdit: true,
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
        canEdit: true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.VENDOR,
        translationKey: 'common.vendor',
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
        translationKey: 'common.description',
        canEdit: true,
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
        canEdit: true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.CATEGORY_GL_CODE,
        translationKey: 'common.categoryGLCode',
        sortColumnName: CONST.SEARCH.SORT_BY_COLUMNS.CATEGORY_GL_CODE,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ATTENDEES,
        translationKey: 'iou.attendees',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE,
        translationKey: 'iou.totalPerAttendee',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAG,
        translationKey: 'common.tag',
        canEdit: true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS,
        translationKey: 'common.violations',
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAG_GL_CODE,
        translationKey: 'common.tagGLCode',
        sortColumnName: CONST.SEARCH.SORT_BY_COLUMNS.TAG_GL_CODE,
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
        columnName: CONST.SEARCH.TABLE_COLUMNS.MCC,
        translationKey: 'common.mcc',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAX_CODE,
        translationKey: 'workspace.taxes.taxCode',
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
        translationKey: 'common.purchaseAmount',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TOTAL,
        translationKey: 'common.total',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID,
        translationKey: 'common.withdrawalID',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_USER_ID,
        translationKey: 'workspace.common.customField1',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID,
        translationKey: 'workspace.common.customField2',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ORDER_DEAL_NUMBERS,
        translationKey: 'common.internationalReimbursementIDs',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        translationKey: groupBy ? 'common.total' : 'iou.amount',
        canEdit: true,
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
        translationKey: 'search.filters.created',
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
        translationKey: 'search.filters.created',
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
        columnName: CONST.SEARCH.TABLE_COLUMNS.FIRST_APPROVER,
        translationKey: 'search.filters.firstApprover',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.FIRST_APPROVED,
        translationKey: 'search.filters.firstApproved',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.PAID_BY,
        translationKey: 'search.filters.paidBy',
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
        columnName: CONST.SEARCH.TABLE_COLUMNS.PAID_STATUS,
        translationKey: 'common.paidStatus',
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
        columnName: CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_USER_ID,
        translationKey: 'workspace.common.customField1',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID,
        translationKey: 'workspace.common.customField2',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ORDER_DEAL_NUMBERS,
        translationKey: 'common.internationalReimbursementIDs',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.AMOUNT_DEBITED,
        translationKey: 'common.amountDebited',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.AMOUNT_REIMBURSED,
        translationKey: 'common.amountReimbursed',
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
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ACTION,
        translationKey: 'common.action',
        isColumnSortable: false,
    },
];

const getTransactionGroupHeaders = (groupBy: SearchGroupBy, icons: SearchHeaderIcons): SearchColumnConfig[] => {
    const groupExpensesHeader: SearchColumnConfig = {
        columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES,
        translationKey: 'common.expenses' as TranslationPaths,
        isColumnSortable: true,
    };
    const groupTotalHeader: SearchColumnConfig = {
        columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
        translationKey: 'common.total' as TranslationPaths,
        isColumnSortable: true,
    };
    const commonGroupHeaders: SearchColumnConfig[] = [groupExpensesHeader, groupTotalHeader];
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
                ...commonGroupHeaders,
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
                ...commonGroupHeaders,
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
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
                    translationKey: 'search.filters.withdrawn',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_STATUS,
                    translationKey: 'common.withdrawalStatus',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_BANK_ACCOUNT,
                    translationKey: 'common.bankAccount',
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
                    translationKey: 'common.withdrawalID',
                },
                groupExpensesHeader,
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_AMOUNT_DEBITED,
                    translationKey: 'common.amountDebited',
                    isColumnSortable: true,
                },
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_AMOUNT_REIMBURSED,
                    translationKey: 'common.amountReimbursed',
                    isColumnSortable: true,
                },
                groupTotalHeader,
            ];
        case CONST.SEARCH.GROUP_BY.CATEGORY:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_CATEGORY,
                    translationKey: 'common.category',
                    isColumnSortable: true,
                },
                ...commonGroupHeaders,
            ];
        case CONST.SEARCH.GROUP_BY.MERCHANT:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT,
                    translationKey: 'common.merchant',
                    isColumnSortable: true,
                },
                ...commonGroupHeaders,
            ];
        case CONST.SEARCH.GROUP_BY.TAG:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_TAG,
                    translationKey: 'common.tag',
                    isColumnSortable: true,
                },
                ...commonGroupHeaders,
            ];
        case CONST.SEARCH.GROUP_BY.DAY:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_DAY,
                    translationKey: 'search.filters.groupBy.day',
                    isColumnSortable: true,
                },
                ...commonGroupHeaders,
            ];
        case CONST.SEARCH.GROUP_BY.MONTH:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
                    translationKey: 'common.month',
                    isColumnSortable: true,
                },
                ...commonGroupHeaders,
            ];
        case CONST.SEARCH.GROUP_BY.WEEK:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK,
                    translationKey: 'common.week',
                    isColumnSortable: true,
                },
                ...commonGroupHeaders,
            ];
        case CONST.SEARCH.GROUP_BY.YEAR:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_YEAR,
                    translationKey: 'common.year',
                    isColumnSortable: true,
                },
                ...commonGroupHeaders,
            ];
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return [
                {
                    columnName: CONST.SEARCH.TABLE_COLUMNS.GROUP_QUARTER,
                    translationKey: 'common.quarter',
                    isColumnSortable: true,
                },
                ...commonGroupHeaders,
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

/** Anchors the column menu below its header cell, at the cell's left edge or, when it opens leftward, its right edge. */
function getColumnMenuAnchorPosition(cellFrame: HeaderCellFrame | undefined, isOnRight: boolean) {
    if (!cellFrame) {
        return {horizontal: 0, vertical: 0};
    }
    return {
        horizontal: isOnRight ? cellFrame.x + cellFrame.width : cellFrame.x,
        vertical: cellFrame.y + cellFrame.height,
    };
}

type SearchTableHeaderProps = {
    columns: SearchColumnType[];
    type: SearchDataTypes;
    sortBy?: SearchSortBy;
    sortOrder?: SortOrder;
    onSortPress: (column: SearchSortBy, order: SortOrder) => void;
    shouldShowYear: boolean;
    shouldShowYearSubmitted?: boolean;
    shouldShowYearApproved?: boolean;
    shouldShowYearPosted?: boolean;
    shouldShowYearExported?: boolean;
    shouldShowYearWithdrawn?: boolean;
    isAmountColumnWide: boolean;
    isTaxAmountColumnWide: boolean;
    shouldShowSorting: boolean;
    canSelectMultiple: boolean;
    groupBy: SearchGroupBy | undefined;

    /** True when we are inside an expense report view, false if we're in the Reports page. */
    isExpenseReportView?: boolean;

    /** True when the action column should render in its wider variant (e.g. tasks, deleted expenses). */
    isActionColumnWide?: boolean;

    /** What the column menu can do to the search. The menu is only offered where columns can also be pinned. */
    columnMenuActions?: SearchColumnMenuActions;
};

type SearchColumnMenuActions = {
    /** Whether the column can be removed from the table. */
    canHideColumn: (column: SearchColumnType) => boolean;

    /** Removes the column from the table. */
    onHideColumn: (column: SearchColumnType) => void;
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
    shouldShowYearWithdrawn,
    shouldShowSorting,
    canSelectMultiple,
    isAmountColumnWide,
    isTaxAmountColumnWide,
    groupBy,
    isExpenseReportView,
    isActionColumnWide,
    columnMenuActions,
}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {pinnedColumns, canPinColumns} = useFrozenColumnState();
    const {pinColumn, unpinColumn} = useFrozenColumnActions();
    const theme = useTheme();
    const {windowWidth} = useWindowDimensions();
    const menuIcons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong', 'Pin', 'Columns', 'EyeDisabled', 'Checkmark']);
    const [columnMenu, setColumnMenu] = useState<{
        columnName: SearchColumnType;
        cellFrame: HeaderCellFrame;
    } | null>(null);
    const columnMenuAnchorRef = useRef<View>(null);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;

    // Only load Profile icon when it's needed for EXPENSE_REPORT type or grouped transactions
    const icons = useMemoizedLazyExpensifyIcons(type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT || !!groupBy ? ['Profile', 'Bank', 'CreditCard'] : []) satisfies SearchHeaderIcons;

    const shouldShowColumn = useCallback(
        (columnName: SearchColumnType) => {
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

    // A menu opened from a column on the right half of the window opens leftward, so it stays on screen.
    const isColumnMenuOnRight = !!columnMenu && columnMenu.cellFrame.x + columnMenu.cellFrame.width / 2 > windowWidth / 2;

    const getColumnMenuItems = (): PopoverMenuItem[] => {
        if (!columnMenu || !columnMenuActions) {
            return [];
        }
        const {columnName} = columnMenu;
        const config = orderedColumnConfig?.find((columnConfigItem) => columnConfigItem.columnName === columnName);
        const sortByColumnName = config?.sortColumnName ?? columnName;
        // A column is sortable unless its config says otherwise, the same default the header itself uses.
        const isSortable = !!config && shouldShowSorting && config.isColumnSortable !== false && columnName !== CONST.SEARCH.TABLE_COLUMNS.COMMENTS;
        const activeSortOrder = sortBy === sortByColumnName ? sortOrder : undefined;
        const isPinnedLeft = pinnedColumns.left.includes(columnName);
        const isPinnedRight = pinnedColumns.right.includes(columnName);

        // The current sort is marked with a checkmark on the right rather than a selected background, so both options
        // read the same and stay pressable.
        const getCurrentSortMarker = (isCurrent: boolean): Partial<PopoverMenuItem> =>
            isCurrent
                ? {
                      shouldShowRightComponent: true,
                      rightComponent: (
                          <View style={styles.alignSelfCenter}>
                              <Icon
                                  src={menuIcons.Checkmark}
                                  fill={theme.success}
                                  width={variables.iconSizeNormal}
                                  height={variables.iconSizeNormal}
                              />
                          </View>
                      ),
                  }
                : {};

        const sortItems: PopoverMenuItem[] = isSortable
            ? [
                  {
                      text: translate('search.columnMenu.sortAscending'),
                      icon: menuIcons.ArrowUpLong,
                      ...getCurrentSortMarker(activeSortOrder === CONST.SEARCH.SORT_ORDER.ASC),
                      onSelected: () => onSortPress(sortByColumnName, CONST.SEARCH.SORT_ORDER.ASC),
                  },
                  {
                      text: translate('search.columnMenu.sortDescending'),
                      icon: menuIcons.ArrowDownLong,
                      ...getCurrentSortMarker(activeSortOrder === CONST.SEARCH.SORT_ORDER.DESC),
                      onSelected: () => onSortPress(sortByColumnName, CONST.SEARCH.SORT_ORDER.DESC),
                  },
              ]
            : [];

        // Anchored columns lead the table like the checkbox, so they can't be pinned.
        const pinItems: PopoverMenuItem[] = isAnchoredLeftColumn(columnName)
            ? []
            : [
                  isPinnedLeft
                      ? {text: translate('search.columnMenu.unpin'), icon: menuIcons.Pin, onSelected: () => unpinColumn(columnName)}
                      : {text: translate('search.columnMenu.pinLeft'), icon: menuIcons.Pin, onSelected: () => pinColumn(columnName, PIN_SIDE.LEFT)},
                  isPinnedRight
                      ? {text: translate('search.columnMenu.unpin'), icon: menuIcons.Pin, onSelected: () => unpinColumn(columnName)}
                      : {text: translate('search.columnMenu.pinRight'), icon: menuIcons.Pin, onSelected: () => pinColumn(columnName, PIN_SIDE.RIGHT)},
              ];

        const columnItems: PopoverMenuItem[] = [
            {
                text: translate('search.editColumns'),
                icon: menuIcons.Columns,
                // Opens the right-hand pane once the menu has closed, like Display's Edit columns.
                shouldCallAfterModalHide: true,
                onSelected: () => Navigation.navigate(ROUTES.SEARCH_COLUMNS),
            },
            {
                text: translate('search.columnMenu.hideColumn'),
                icon: menuIcons.EyeDisabled,
                disabled: !columnMenuActions.canHideColumn(columnName),
                onSelected: () => columnMenuActions.onHideColumn(columnName),
            },
        ];

        // Each group after the first is set apart by a divider.
        return [sortItems, pinItems, columnItems]
            .filter((group) => group.length > 0)
            .flatMap((group, groupIndex) => group.map((item, itemIndex) => ({...item, addSeparatorBefore: groupIndex > 0 && itemIndex === 0})));
    };

    if (displayNarrowVersion) {
        return;
    }

    if (!orderedColumnConfig) {
        return;
    }

    return (
        <>
            <SortableTableHeader
                columns={orderedColumnConfig}
                shouldShowColumn={shouldShowColumn}
                isDateColumnCreated={isCreatedDateType(type)}
                dateColumnSize={shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                submittedColumnSize={shouldShowYearSubmitted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                approvedColumnSize={shouldShowYearApproved ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                postedColumnSize={shouldShowYearPosted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                exportedColumnSize={shouldShowYearExported ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                withdrawnColumnSize={shouldShowYearWithdrawn ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                amountColumnSize={isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                taxAmountColumnSize={isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                shouldShowSorting={shouldShowSorting}
                sortBy={sortBy}
                sortOrder={sortOrder}
                shouldRemoveTotalColumnFlex={!!groupBy !== !!isExpenseReportView}
                isActionColumnWide={isActionColumnWide ?? type === CONST.SEARCH.DATA_TYPES.TASK}
                // Don't butt up against the 'select all' checkbox if present
                containerStyles={canSelectMultiple && [styles.pl3]}
                onSortPress={(columnName, order) => {
                    if (columnName === CONST.SEARCH.TABLE_COLUMNS.COMMENTS) {
                        return;
                    }
                    onSortPress(columnName, order);
                }}
                onColumnMenuPress={
                    canPinColumns && !isExpenseReportView && columnMenuActions
                        ? (columnName, cellFrame) => {
                              setColumnMenu({columnName, cellFrame});
                          }
                        : undefined
                }
            />
            <PopoverMenu
                isVisible={!!columnMenu}
                onClose={() => setColumnMenu(null)}
                onItemSelected={() => setColumnMenu(null)}
                anchorPosition={getColumnMenuAnchorPosition(columnMenu?.cellFrame, isColumnMenuOnRight)}
                anchorAlignment={{
                    horizontal: isColumnMenuOnRight ? CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT : CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                anchorRef={columnMenuAnchorRef}
                menuItems={getColumnMenuItems()}
            />
        </>
    );
}

export {getExpenseHeaders};
export default SearchTableHeader;
export type {SearchColumnMenuActions};
