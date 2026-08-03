import useThemeStyles from '@hooks/useThemeStyles';

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

    /**
     * Whether `TableBody` still renders content while the table is empty (e.g. an empty-state or header list slot is
     * supplied). When it does, it keeps its own `role="rowgroup"`, so the `role="table"` wrapper must be preserved to
     * avoid orphaned table semantics.
     */
    rendersBodyWhenEmpty: boolean;

    /** Table children — expected to contain a contiguous `TableHeader`/`TableBody` run. */
    children: React.ReactNode;
};

/**
 * Wraps only the contiguous header/body run in the `role="table"` container so that surrounding controls (filter bar,
 * empty states, …) stay outside the ARIA table, where a screen reader would otherwise navigate into them as table
 * content. When semantics are disabled the children render as-is, avoiding an extra layout node on native and in the
 * narrow card layout. Header and body are contiguous in every table, so grouping the consecutive run keeps a single
 * table container while preserving child order.
 */
function TableSemanticContainer({isEnabled, title, rowCount, columnCount, rendersBodyWhenEmpty, children}: TableSemanticContainerProps) {
    const styles = useThemeStyles();

    if (!isEnabled) {
        return children;
    }

    // An empty table whose header/body both render null has no tabular content for a screen reader, so skip the wrapper
    // to avoid an extra flex:1 node next to the empty-state view that would share its height and shift it upward. (When
    // the body still renders it keeps its own role="rowgroup", so `rendersBodyWhenEmpty` keeps the wrapper.)
    //
    // Use `React.Children.toArray` so the children's top-level keys (`.0`, `.1`, …) match the wrapped branch below;
    // otherwise React remounts a child across the empty↔non-empty boundary — for `Table.FilterBar` that runs its
    // unmount cleanup and wipes the active search string.
    if (rowCount === 0 && !rendersBodyWhenEmpty) {
        return React.Children.toArray(children);
    }

    const renderedChildren: React.ReactNode[] = [];
    let rowGroup: React.ReactNode[] = [];

    const flushRowGroup = () => {
        if (rowGroup.length === 0) {
            return;
        }

        renderedChildren.push(
            <View
                key={`tableSemanticContainer-${renderedChildren.length}`}
                style={[styles.flex1, styles.mnh0]}
                {...getTableContainerAccessibilityProps(true, title, rowCount, columnCount)}
            >
                {rowGroup}
            </View>,
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
