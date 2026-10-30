/** Shares a single column's heading data (name, label, layout style, sorting) from `SortableTableHeader` to the child that renders its heading. */
import type {StyleProp, ViewStyle} from 'react-native';

import React, {createContext, useContext} from 'react';

import type {SortableHeaderLabelProps} from './SortableHeaderText';
import type {SearchColumnType, SortOrder} from './types';

type SortableColumnSorting = {
    /** `undefined` when the table is sorted by another column. */
    activeSortOrder: SortOrder | undefined;

    onSort: (sortOrder: SortOrder) => void;
};

/** The column whose heading a `SortableTableHeader` child renders. */
type SortableColumn = {
    columnName: SearchColumnType;
    label: string;

    /** Lays out the heading cell. */
    style: StyleProp<ViewStyle>;

    /** `undefined` when the column doesn't sort. */
    sorting: SortableColumnSorting | undefined;

    /** The heading's label, for `SortableHeaderLabel`. */
    labelProps: SortableHeaderLabelProps;
};

/** Gives a `SortableTableHeader` child the column it renders the heading of. */
const SortableColumnContext = createContext<SortableColumn | undefined>(undefined);

function useSortableColumn(): SortableColumn {
    const column = useContext(SortableColumnContext);
    if (!column) {
        throw new Error('useSortableColumn must be used inside a SortableTableHeader child');
    }
    return column;
}

type SortableColumnProviderProps = SortableColumn & {
    children: React.ReactNode;
};

function SortableColumnProvider({columnName, label, style, sorting, labelProps, children}: SortableColumnProviderProps) {
    const column = {columnName, label, style, sorting, labelProps};
    return <SortableColumnContext.Provider value={column}>{children}</SortableColumnContext.Provider>;
}

export {SortableColumnProvider, useSortableColumn};
