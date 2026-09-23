import ScrollView from '@components/ScrollView';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {LayoutChangeEvent} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import {getTableContainerAccessibilityProps} from './tableAccessibility';
import TableBody from './TableBody';
import TableHeader from './TableHeader';

type TableSemanticContainerProps = {
    /** Whether table ARIA semantics should be applied (web + wide layout only). */
    isEnabled: boolean;

    /** Accessible label for the table, announced by screen readers. */
    title: string | undefined;

    /** Total number of data rows (excludes the header row). */
    rowCount: number;

    /** Number of columns, including the leading selection column when present. */
    columnCount: number;

    /** Whether the table exposes a column-header row, which `aria-rowcount` has to count alongside the data rows. */
    hasHeaderRow: boolean;

    /**
     * Whether `TableBody` still renders content while an inline-semantic table is empty (e.g. an empty-state or list
     * header is supplied). Its `role="rowgroup"` then needs the enclosing `role="table"` wrapper.
     */
    rendersBodyWhenEmpty: boolean;

    /**
     * The width the rows need when the columns don't fit, which scrolls the header/body run horizontally as one so the
     * header stays aligned with its rows. Set only for tables whose filter bar isn't in the list. The others are
     * scrolled by the list itself (see `TableBody`).
     */
    scrollWidth: number | undefined;

    /**
     * Measures the width the table's columns have to share. This node is the right thing to measure because it keeps the
     * table's own width even while its content overflows and scrolls, so measuring it can't feed back into the widths it
     * produced.
     */
    onLayout: ((event: LayoutChangeEvent) => void) | undefined;

    /** Table children — expected to contain a contiguous `TableHeader`/`TableBody` run. */
    children: React.ReactNode;
};

/**
 * Wraps only the contiguous header/body run so that it can be measured and scrolled horizontally when dynamic columns
 * are enabled. The same wrapper carries `role="table"` when table semantics are enabled, keeping surrounding controls
 * (filter bar, empty states, …) outside the ARIA table. When neither layout handling nor semantics are needed, the
 * children render as-is to avoid an extra layout node. Header and body are contiguous in every table, so grouping the
 * consecutive run keeps a single table container while preserving child order.
 *
 * Columns that don't fit are scrolled here by wrapping that run in a horizontal scroller, which carries header and
 * rows as one. Tables with an in-list filter bar can't use it, because the scroller would drag that bar sideways too,
 * so their list takes the horizontal axis itself (see `TableBody`).
 */
function TableSemanticContainer({isEnabled, title, rowCount, columnCount, hasHeaderRow, rendersBodyWhenEmpty, scrollWidth, onLayout, children}: TableSemanticContainerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const shouldWrapTableRun = isEnabled || onLayout !== undefined || scrollWidth !== undefined;
    if (!shouldWrapTableRun) {
        return children;
    }

    // An empty table whose header/body both render null has no tabular content for a screen reader, so skip the wrapper
    // to avoid an extra flex:1 node next to the empty-state view that would share its height and shift it upward. (When
    // the body still renders it keeps its own role="rowgroup", so `rendersBodyWhenEmpty` keeps the wrapper.)
    //
    // Use `React.Children.toArray` so the children's top-level keys (`.0`, `.1`, …) match the wrapped branch below;
    // otherwise React remounts a child across the empty↔non-empty boundary — for `Table.FilterBar` that runs its
    // unmount cleanup and wipes the active search string.
    if (isEnabled && rowCount === 0 && !rendersBodyWhenEmpty && onLayout === undefined && scrollWidth === undefined) {
        return React.Children.toArray(children);
    }

    const renderedChildren: React.ReactNode[] = [];
    let rowGroup: React.ReactNode[] = [];

    const flushRowGroup = () => {
        if (rowGroup.length === 0) {
            return;
        }

        const rowGroupContainer = (
            <View
                key={`tableSemanticContainer-${renderedChildren.length}`}
                style={[styles.flex1, styles.mnh0]}
                // The columns are measured against this node while the table fits, and against the scroll view below once
                // it doesn't. Either way the measured node keeps the table's own width rather than growing with the
                // content, so measuring it can't feed back into the widths it produced.
                onLayout={scrollWidth ? undefined : onLayout}
                {...getTableContainerAccessibilityProps(isEnabled, title, rowCount, columnCount, hasHeaderRow)}
            >
                {rowGroup}
            </View>
        );

        // The columns don't fit, so the header and the body scroll horizontally as one and stay aligned. The content
        // container carries the width they need, and the rows fill it, matching how the Search table scrolls.
        renderedChildren.push(
            scrollWidth ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator
                    key={`tableSemanticContainerScroll-${renderedChildren.length}`}
                    style={[styles.flex1, styles.mnh0]}
                    contentContainerStyle={StyleUtils.getWidthStyle(scrollWidth)}
                    onLayout={onLayout}
                >
                    {rowGroupContainer}
                </ScrollView>
            ) : (
                rowGroupContainer
            ),
        );
        rowGroup = [];
    };

    for (const child of React.Children.toArray(children)) {
        if (React.isValidElement(child) && (child.type === TableHeader || child.type === TableBody)) {
            rowGroup.push(child);
            continue;
        }

        flushRowGroup();
        renderedChildren.push(child);
    }
    flushRowGroup();

    return renderedChildren;
}

TableSemanticContainer.displayName = 'TableSemanticContainer';

export default TableSemanticContainer;
