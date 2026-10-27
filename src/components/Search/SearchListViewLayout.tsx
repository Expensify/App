import ColumnResizeContext from '@components/Table/columnResize/ColumnResizeContext';
import ColumnResizeScope from '@components/Table/columnResize/ColumnResizeScope';
import useColumnResize from '@components/Table/columnResize/useColumnResize';
import useStoredColumnWidths from '@components/Table/columnResize/useStoredColumnWidths';

import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {canMeasureText} from '@libs/measureTextWidth';
import {getSearchColumnResizingID} from '@libs/SearchUIUtils';

import type {GetReportTableColumnStylesParams} from '@styles/utils';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {CardList, PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import type {SearchListItem} from './SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from './types';

import useSearchColumnWidths from './hooks/useSearchColumnWidths';
import useSearchTableWidth from './hooks/useSearchTableWidth';
import HorizontalTableScroll from './primitives/HorizontalTableScroll';
import {SearchColumnWidthsProvider} from './SearchColumnWidthsContext';

type SearchListViewLayoutProps = {
    /** Columns rendered in the table (drives the min-width for horizontal scroll). */
    columns: SearchColumnType[];

    /** Search data type (sizes the action column). */
    type: SearchQueryJSON['type'];

    /** Together with `type`, picks the stored column widths, since each table shape shows its own columns. */
    groupBy: SearchQueryJSON['groupBy'];

    /** Whether the action column uses its wider variant. */
    isActionColumnWide: boolean;

    /** Which columns render in their wider variant, decided across the whole search and shared with the column header. */
    columnSizeOptions: GetReportTableColumnStylesParams;

    /** Whether a column header is present (gates horizontal scroll). */
    isHeaderVisible: boolean;

    /** Re-restores the saved horizontal offset whenever it changes (typically the list data). */
    dataKey: unknown;

    /** Whether the keyboard is shown (suppresses the bottom safe-area padding). */
    isKeyboardShown: boolean;

    /** The bottom safe-area padding style applied when the keyboard is hidden. */
    safeAreaPaddingBottomStyle: StyleProp<ViewStyle>;

    containerStyle: StyleProp<ViewStyle>;

    /** The rendered transactions, so the free-text columns can be sized from them. Left out, columns keep their widths. */
    data?: SearchListItem[];

    /** The viewer's non-personal and workspace cards, so the card column can be sized from the names it renders. */
    nonPersonalAndWorkspaceCards?: CardList;

    /** Every policy's categories, so the category GL code column can be sized from the codes it renders. */
    policyCategories?: OnyxCollection<PolicyCategories>;

    /** Every policy's tag lists, so the tag GL code column can be sized from the codes it renders. */
    policyTags?: OnyxCollection<PolicyTagLists>;

    /** The list and any header/modal blocks, composed by the view (e.g. SelectionTopBar, BaseSearchList, long-press menu). */
    children: React.ReactNode;
};

type SearchListViewLayoutContentProps = Omit<SearchListViewLayoutProps, 'groupBy'> & {
    /** `undefined` when the table can't resize its columns. */
    columnResizingID: string | undefined;

    /** `undefined` until the first drag, and when the table can't resize its columns. */
    storedTableColumnWidths: StoredTableColumnWidths | undefined;
};

function SearchListViewLayoutContent({
    columns,
    type,
    isActionColumnWide,
    columnSizeOptions,
    isHeaderVisible,
    dataKey,
    isKeyboardShown,
    safeAreaPaddingBottomStyle,
    containerStyle,
    data,
    nonPersonalAndWorkspaceCards,
    policyCategories,
    policyTags,
    columnResizingID,
    storedTableColumnWidths,
    children,
}: SearchListViewLayoutContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const {tableWidthRef, tableWidth, onTableLayout} = useSearchTableWidth();

    const {columnWidths, resizableLayout} = useSearchColumnWidths({
        columns,
        data: data ?? [],
        tableWidth,
        // A header is only rendered in the table layout. Narrow layouts render rows as cards with no columns to size.
        isEnabled: isHeaderVisible && !!data,
        columnSizeOptions,
        measurementContext: {nonPersonalAndWorkspaceCards, policyCategories, policyTags},
        isColumnResizingEnabled: !!columnResizingID,
        storedTableColumnWidths,
    });

    // Passed before the table is measured, so the scope element mounts once and never remounts the rows.
    // Edges only start dragging once a layout exists.
    const columnResize = useColumnResize({
        columnResizingID,
        resizableColumnKeys: resizableLayout?.resizableColumnKeys ?? [],
        getResizedColumnWidths: resizableLayout?.getResizedColumnWidths ?? ((columnKey, width) => ({[columnKey]: width})),
        resolvedColumnWidths: resizableLayout?.resolvedColumnWidths ?? CONST.EMPTY_OBJECT,
        dragMinWidths: resizableLayout?.dragMinWidths,
        getStoredTableColumnWidths: resizableLayout?.getStoredTableColumnWidths,
        getTargetColumnWidth: resizableLayout?.getTargetColumnWidth,
        columnGap: variables.searchTableColumnGap,
    });

    const resizableColumnWidths: Partial<Record<SearchColumnType, number>> = {};

    for (const column of columns) {
        if (resizableLayout?.resizableColumnKeys.includes(column)) {
            resizableColumnWidths[column] = resizableLayout.resolvedColumnWidths[column];
        }
    }

    // The scroller decides whether to scroll by summing what each column refuses to shrink below, which it otherwise has
    // to estimate. Every minimum it can be told exactly is resolved here instead: a dynamic column measured its own, and
    // any other column that declares a width is never laid out narrower than it. The estimates run several columns 70px
    // or more over their real width, so a table left on them reserves room it never uses, scrolls before it has run out
    // of space, and then stretches its columns across the width it wrongly claimed.
    //
    // Only for a table that is being sized. Correcting the scroller's arithmetic changes how wide the table lays out,
    // and a view that isn't sized has rows built for the widths it already had - a grouped view nests a whole table of
    // its own inside its rows, tuned against the old numbers. Handing those views a better answer to a question this
    // branch isn't yet answering for them moves their columns for no gain.
    const isSizingColumns = Object.keys(columnWidths).length > 0;

    const columnMinWidths: Partial<Record<SearchColumnType, number>> = {};

    // The columns this table lays out, so the sizing below is applied to those and to nothing else that renders under it.
    const sizedColumns = new Set(columns);

    // What each column would rather have than its minimum. Only the dynamic columns differ between the two: everything
    // else is pinned to one width, so it wants exactly what it is never squeezed below.
    const columnContentWidths: Partial<Record<SearchColumnType, number>> = {};

    for (const column of columns) {
        const sizing = columnWidths[column];

        if (sizing) {
            columnMinWidths[column] = sizing.minWidth;
            columnContentWidths[column] = sizing.contentWidth;
            continue;
        }

        const declaredWidth = StyleUtils.getReportTableColumnStyles(column, columnSizeOptions).width;

        // A column styled with flex alone declares no width, so the scroller keeps estimating that one.
        if (typeof declaredWidth === 'number') {
            columnMinWidths[column] = declaredWidth;
            columnContentWidths[column] = declaredWidth;
        }
    }

    return (
        // Measured outside the scroller, so this reports the width the table has to fit into rather than the width its
        // content grew to. The page is inset from the window, so the window is wider and can't answer this.
        <View
            ref={tableWidthRef}
            style={styles.flex1}
            onLayout={onTableLayout}
        >
            <SearchColumnWidthsProvider
                columnWidths={columnWidths}
                sizedColumns={sizedColumns}
                columnOptions={columnSizeOptions}
                resizableColumnWidths={resizableLayout ? resizableColumnWidths : undefined}
            >
                <ColumnResizeContext.Provider value={columnResize}>
                    {/* Wraps the scroller too, so one width write resizes its content along with the header and rows. */}
                    <ColumnResizeScope onScopeElement={columnResize?.setScopeElement}>
                        <HorizontalTableScroll
                            columns={columns}
                            type={type}
                            isActionColumnWide={isActionColumnWide}
                            isHeaderVisible={isHeaderVisible}
                            dataKey={dataKey}
                            columnMinWidths={isSizingColumns ? columnMinWidths : undefined}
                            columnContentWidths={isSizingColumns ? columnContentWidths : undefined}
                            availableWidth={isSizingColumns ? tableWidth : undefined}
                            resizableScrollWidth={resizableLayout?.scrollWidth}
                        >
                            <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>{children}</View>
                        </HorizontalTableScroll>
                    </ColumnResizeScope>
                </ColumnResizeContext.Provider>
            </SearchColumnWidthsProvider>
        </View>
    );
}

function SearchListViewLayoutWithStoredColumnWidths(props: Omit<SearchListViewLayoutContentProps, 'storedTableColumnWidths'> & {columnResizingID: string}) {
    const storedTableColumnWidths = useStoredColumnWidths(props.columnResizingID);

    return (
        <SearchListViewLayoutContent
            {...props}
            storedTableColumnWidths={storedTableColumnWidths}
        />
    );
}

/**
 * The shared chrome around every Search list view: the horizontal table scroller and the keyboard/safe-area
 * aware container. Purely presentational, each view composes its own header, list, and long-press menu as
 * children so view-specific blocks and list props (grouping, footers) stay with the view.
 */
function SearchListViewLayout({groupBy, ...props}: SearchListViewLayoutProps) {
    const {isBetaEnabled} = usePermissions();

    // Saved widths are replayed by content sizing, so only tables that size from their rows can resize.
    // The header is left out so crossing the wide breakpoint doesn't remount the list.
    const canResizeColumns = !!props.data && canMeasureText() && isBetaEnabled(CONST.BETAS.RESIZABLE_TABLE_COLUMNS);

    // Only tables that can resize subscribe to stored widths.
    if (!canResizeColumns) {
        return (
            <SearchListViewLayoutContent
                {...props}
                columnResizingID={undefined}
                storedTableColumnWidths={undefined}
            />
        );
    }

    return (
        <SearchListViewLayoutWithStoredColumnWidths
            {...props}
            columnResizingID={getSearchColumnResizingID(props.type, groupBy)}
        />
    );
}

SearchListViewLayout.displayName = 'SearchListViewLayout';

export default SearchListViewLayout;
