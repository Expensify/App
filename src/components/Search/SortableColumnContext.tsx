/** Shares a single column's heading data (name, label, alignment, sorting) from `SortableTableHeader` to the child that renders its heading. */
import type {ColumnSorting} from '@components/Table/ColumnHeaderMenu';

import type {SearchColumnAlignment} from '@styles/utils';

import React, {createContext, useContext} from 'react';

import type {SortableHeaderLabelProps} from './SortableHeaderText';
import type {SearchColumnType} from './types';

/** The column whose heading a `SortableTableHeader` child renders. */
type SortableColumn = {
    columnName: SearchColumnType;
    label: string;

    /** Where the column's cells place their content, which the heading follows. */
    alignment: SearchColumnAlignment;

    /** Whether a resize handle sits over the heading's right edge. */
    hasResizeHandle: boolean;

    /** `undefined` when the column doesn't sort. */
    sorting: ColumnSorting | undefined;

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

function SortableColumnProvider({children, ...column}: SortableColumnProviderProps) {
    return <SortableColumnContext.Provider value={column}>{children}</SortableColumnContext.Provider>;
}

export {SortableColumnProvider, useSortableColumn};
