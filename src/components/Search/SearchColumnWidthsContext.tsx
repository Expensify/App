import useStyleUtils from '@hooks/useStyleUtils';

import type {GetReportTableColumnStylesParams} from '@styles/utils';

import type {ViewStyle} from 'react-native';

import React, {createContext, useContext} from 'react';

import type {SearchColumnSizing} from './hooks/useSearchColumnWidths';
import type {SearchColumnType} from './types';

/**
 * How the Search table's dynamically sized columns share its free space. Columns absent from this map keep the flex or
 * fixed width they are styled with, which is also the whole map's state when dynamic sizing doesn't apply.
 */
type SearchColumnWidths = Partial<Record<SearchColumnType, SearchColumnSizing>>;

type SearchColumnSizingState = {
    /** What each measured column was sized to. */
    columnWidths: SearchColumnWidths;

    /**
     * The columns the sized table lays out, which is not every column rendered underneath it: a grouped table's rows can
     * expand to show their transactions, and those inner rows have columns of their own that this sizing says nothing
     * about. They are left exactly as they are styled.
     */
    sizedColumns: Set<SearchColumnType>;

    /**
     * Which columns take their wider variant across the whole table. A row that renders one of these columns without
     * saying which variant it wants gets the table's answer, rather than defaulting to the narrow one and standing a
     * column short of the heading above it.
     */
    columnOptions: GetReportTableColumnStylesParams;
};

/**
 * Defaults to sizing nothing, because the components that read this are shared well beyond the Search table: the same
 * row and heading render in the Money Request report, the unreported expense list, and the duplicate and merge
 * transaction pages, none of which mount the provider. Those keep the widths they are styled with.
 */
const SearchColumnWidthsContext = createContext<SearchColumnSizingState>({columnWidths: {}, sizedColumns: new Set(), columnOptions: {}});

function SearchColumnWidthsProvider({columnWidths, sizedColumns, columnOptions, children}: React.PropsWithChildren<SearchColumnSizingState>) {
    return <SearchColumnWidthsContext.Provider value={{columnWidths, sizedColumns, columnOptions}}>{children}</SearchColumnWidthsContext.Provider>;
}

/**
 * Returns the Search table's column style function, with any measured width applied on top.
 *
 * The header and every row resolve their columns through this, so a column is measured in both or in neither and the
 * two stay aligned.
 */
function useSearchColumnStyles(): (columnName: SearchColumnType, options?: GetReportTableColumnStylesParams) => ViewStyle {
    const StyleUtils = useStyleUtils();
    const {columnWidths, sizedColumns, columnOptions} = useContext(SearchColumnWidthsContext);

    const isSizingColumns = Object.keys(columnWidths).length > 0;

    return (columnName, options = {}) => {
        // Only for the table's own columns, and only where the caller didn't answer: an inner table rendered below this
        // one sizes its columns from its own rows, and a caller that names a variant knows something this doesn't.
        //
        // Only while this table is being sized, too. The table-wide variants exist to stop a sized row and its heading
        // disagreeing about a width, so with nothing sized they answer a question nobody asked - and answering it does
        // harm. These variants are decided across the whole search, while a group expanded inside it decides its own
        // from its own transactions and passes them to its heading and its rows. Filling the gaps from the search-wide
        // set leaves a row on one answer and its heading on the other, which slides every column after it sideways.
        const columnStyles = StyleUtils.getReportTableColumnStyles(columnName, isSizingColumns && sizedColumns.has(columnName) ? {...columnOptions, ...options} : options);
        const sizing = columnWidths[columnName];

        if (!sizing) {
            // `flex: 1` expands to a zero basis, which discards any width declared beside it: the column starts from
            // nothing and shares the leftover space, ending up neither its declared width nor what its content needs.
            // That declared width is what it was sized to fit, so pin it there exactly. Not narrower, since a truncated
            // amount reads as a different amount rather than as a truncation. Not wider either, since the spare room
            // belongs to the free-text columns. Same reasoning as the existing `shouldRemoveTotalColumnFlex`.
            //
            // Only for a column of the sized table itself. A column belonging to some inner table rendered below it was
            // never part of what was measured, so pinning it would hold it to a width chosen for a different layout.
            if (isSizingColumns && sizedColumns.has(columnName) && typeof columnStyles.width === 'number' && columnStyles.flex !== undefined) {
                return {...columnStyles, flex: undefined, flexGrow: 0, flexShrink: 0, flexBasis: columnStyles.width, minWidth: columnStyles.width};
            }

            return columnStyles;
        }

        // A hugging column is sized to its content and pinned there, the same way a column with a declared width is.
        if (sizing.shouldHug) {
            return {...columnStyles, flex: undefined, flexGrow: 0, flexShrink: 0, flexBasis: sizing.contentWidth, minWidth: sizing.contentWidth, width: undefined};
        }

        // The resolved width is the column's starting size, not its final one: it still grows and shrinks from there.
        //
        // That is what the model already asks for. A column settled at its content width is settled by the resolver and
        // reaches this with nothing left to share, while the columns splitting the remainder were each given an equal
        // slice of it - so growing them all by one unit keeps that slice equal and simply hands out whatever the budget
        // was short by. Pinning them instead would leave that difference as a band of empty space at the end of the
        // row, which is what the rows' own padding and chrome, spread across several differently shaped row
        // components, make impossible to predict to the pixel from here.
        //
        // Shrinking is the same argument in the other direction, floored at the width below which the column stops
        // being readable. `flex` is cleared because the base style sets it on exactly these columns, and leaving both
        // it and the properties below would make which one wins depend on emission order.
        return {...columnStyles, flex: undefined, flexGrow: 1, flexShrink: 1, flexBasis: sizing.width ?? 0, minWidth: sizing.minWidth, width: undefined};
    };
}

export {SearchColumnWidthsProvider, useSearchColumnStyles};
