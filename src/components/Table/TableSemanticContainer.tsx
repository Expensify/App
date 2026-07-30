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
function TableSemanticContainer({isEnabled, title, rowCount, columnCount, children}: TableSemanticContainerProps) {
    const styles = useThemeStyles();

    if (!isEnabled) {
        return children;
    }

    // An empty table (no data rows) has no tabular content to expose to a screen reader, and the header/body
    // render nothing in that case. Skipping the wrapper avoids inserting an extra flex:1 layout node next to the
    // empty-state view, which would otherwise share the available height and shift the empty state upward.
    if (rowCount === 0) {
        return children;
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
