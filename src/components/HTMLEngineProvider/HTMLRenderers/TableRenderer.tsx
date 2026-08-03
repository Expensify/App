import variables from '@styles/variables';

import type {CustomRendererProps, TBlock, TNode} from 'react-native-render-html';

import {useContext, useMemo} from 'react';
import {useContentWidth} from 'react-native-render-html';

import type {CellHorizontalAlignment} from './TableColumnAlignmentContext';

import HTMLTableScroll from './HTMLTableScroll';
import TableChildrenRenderer, {getElementChildren} from './TableChildrenRenderer';
import TableColumnAlignmentContext from './TableColumnAlignmentContext';
import TableContentWidthContext from './TableContentWidthContext';

/**
 * Derives the horizontal alignment for each column from the table body. Concierge expense tables put the amount in
 * the last column and carry no alignment attributes, so the last column is right-aligned to match how amounts are
 * shown elsewhere in the app; every other column stays left-aligned.
 */
function getColumnAlignments(tableNode: TNode): CellHorizontalAlignment[] {
    const bodyRows = getElementChildren(tableNode)
        .filter((section) => section.tagName === 'tbody')
        .flatMap((section) => getElementChildren(section));
    if (bodyRows.length === 0) {
        return [];
    }

    const columnCount = bodyRows.reduce((max, row) => Math.max(max, getElementChildren(row).length), 0);
    return Array.from({length: columnCount}, (_, columnIndex) => (columnIndex === columnCount - 1 ? 'right' : 'left'));
}

function TableRenderer({tnode}: CustomRendererProps<TBlock>) {
    const columnAlignments = useMemo(() => getColumnAlignments(tnode), [tnode]);

    // The comment-level width fills the message exactly; fall back to the HTML content width when the table is rendered
    // outside a comment. A concrete number is required because the scroller needs a fixed viewport and content width.
    const measuredContentWidth = useContext(TableContentWidthContext);
    const fallbackContentWidth = useContentWidth();
    const viewportWidth = measuredContentWidth || fallbackContentWidth;
    const columnsWidth = columnAlignments.length * variables.htmlTableColumnMaxWidth + 2 * variables.tableRowPaddingHorizontal;
    const contentWidth = Math.max(viewportWidth, columnsWidth);

    return (
        <TableColumnAlignmentContext.Provider value={columnAlignments}>
            <HTMLTableScroll
                viewportWidth={viewportWidth}
                contentWidth={contentWidth}
            >
                <TableChildrenRenderer tnode={tnode} />
            </HTMLTableScroll>
        </TableColumnAlignmentContext.Provider>
    );
}

export default TableRenderer;
