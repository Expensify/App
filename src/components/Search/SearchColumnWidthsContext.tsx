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
 * The header and every row resolve their columns through this, so a column is measured in both or in neither and the
 * two stay aligned.
 */
function useSearchColumnStyles(): (columnName: SearchColumnType, options?: GetReportTableColumnStylesParams) => ViewStyle {
    const StyleUtils = useStyleUtils();
    const columnWidths = useContext(SearchColumnWidthsContext);

    const isSizingColumns = Object.keys(columnWidths).length > 0;

    return (columnName, options = {}) => {
        const columnStyles = StyleUtils.getReportTableColumnStyles(columnName, options);
        const sizing = columnWidths[columnName];

        if (!sizing) {
            // `flex: 1` expands to a zero basis, which discards any width declared beside it: the column starts from
            // nothing and shares the leftover space, ending up neither its declared width nor what its content needs.
            // That declared width is what it was sized to fit, so pin it there exactly. Not narrower, since a truncated
            // amount reads as a different amount rather than as a truncation. Not wider either, since the spare room
            // belongs to the free-text columns. Same reasoning as the existing `shouldRemoveTotalColumnFlex`.
            if (isSizingColumns && typeof columnStyles.width === 'number' && columnStyles.flex !== undefined) {
                return {...columnStyles, flex: undefined, flexGrow: 0, flexShrink: 0, flexBasis: columnStyles.width, minWidth: columnStyles.width};
            }

            return columnStyles;
        }

        // A hugging column is sized to its content and pinned there, the same way a column with a declared width is.
        if (sizing.shouldHug) {
            return {...columnStyles, flex: undefined, flexGrow: 0, flexShrink: 0, flexBasis: sizing.contentWidth, minWidth: sizing.contentWidth, width: undefined};
        }

        // The measured width is a share of the free space, not a width of its own: growing from a zero basis in
        // proportion to what the content needs is what makes the columns add up to the row without this knowing what
        // the fixed columns, gaps, and padding spend. `flex` is cleared because the base style sets it on exactly these
        // columns, and leaving both it and the properties below would make which one wins depend on emission order.
        return {...columnStyles, flex: undefined, flexGrow: sizing.flexWeight, flexShrink: 1, flexBasis: 0, minWidth: sizing.minWidth, width: undefined};
    };
}

export {SearchColumnWidthsProvider, useSearchColumnStyles};
