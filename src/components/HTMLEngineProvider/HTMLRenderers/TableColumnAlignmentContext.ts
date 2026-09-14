import {createContext} from 'react';

type CellHorizontalAlignment = 'left' | 'center' | 'right';

/**
 * Per-column horizontal alignment for the table currently being rendered, indexed by column position.
 * The Concierge HTML never carries alignment attributes, so `TableRenderer` derives it from the cell
 * contents and shares it here so both the header cell and the body cells of a column stay in sync.
 */
const TableColumnAlignmentContext = createContext<CellHorizontalAlignment[]>([]);

export default TableColumnAlignmentContext;
export type {CellHorizontalAlignment};
