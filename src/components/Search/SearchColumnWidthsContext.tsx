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

const SearchColumnWidthsContext = createContext<SearchColumnWidths>({});

function SearchColumnWidthsProvider({columnWidths, children}: React.PropsWithChildren<{columnWidths: SearchColumnWidths}>) {
    return <SearchColumnWidthsContext.Provider value={columnWidths}>{children}</SearchColumnWidthsContext.Provider>;
}

/**
 * Returns the Search table's column style function, with any measured width applied on top.
 *
 * The header and every row resolve their columns through this, so they stay aligned: a column is either measured in
 * both or in neither. When a column has a measured width it is pinned to it, replacing the flex that would otherwise
 * have it share the table's leftover space equally with the other free-text columns.
 */
function useSearchColumnStyles(): (columnName: SearchColumnType, options?: GetReportTableColumnStylesParams) => ViewStyle {
    const StyleUtils = useStyleUtils();
    const columnWidths = useContext(SearchColumnWidthsContext);

    const isSizingColumns = Object.keys(columnWidths).length > 0;

    return (columnName, options = {}) => {
        const columnStyles = StyleUtils.getReportTableColumnStyles(columnName, options);
        const sizing = columnWidths[columnName];

        if (!sizing) {
            // A column styled `flex: 1` alongside a width has a zero flex basis, which discards that width: it starts
            // from nothing and only ever gets a share of the leftover space. That was harmless while every column was
            // equally shrinkable, but the measured columns now hold a minimum, so a column with no floor of its own
            // absorbs all of the shortfall and truncates its value. Its declared width becomes both the size it grows
            // from and the size it will not shrink past, since that width is what the column was sized to fit: the
            // amount column, for one, is already widened separately when its values are long, and an amount that has
            // been cut short reads as a different number rather than as a truncation.
            if (isSizingColumns && typeof columnStyles.width === 'number' && columnStyles.flex !== undefined) {
                return {...columnStyles, flex: undefined, flexGrow: columnStyles.flex, flexShrink: 1, flexBasis: columnStyles.width, minWidth: columnStyles.width};
            }

            return columnStyles;
        }

        // The measured width is the column's share of the free space rather than a width of its own: growing from a
        // zero basis in proportion to what its content needs is what keeps the columns adding up to the row exactly,
        // without this having to know what the fixed columns, gaps, and padding around it spend. The `flex` shorthand is
        // cleared because the base style sets it on exactly these columns, and leaving both it and the individual properties here
        // would make which one wins depend on the order they are emitted in.
        return {...columnStyles, flex: undefined, flexGrow: sizing.flexWeight, flexShrink: 1, flexBasis: 0, minWidth: sizing.minWidth, width: undefined};
    };
}

export {SearchColumnWidthsProvider, useSearchColumnStyles};
