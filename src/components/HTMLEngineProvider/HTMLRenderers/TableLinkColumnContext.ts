import {createContext} from 'react';

/**
 * The column index whose links make each body row of the table currently being rendered navigable, or undefined when
 * the table has no such column. `TableRenderer` derives it and shares it so the row renderer can navigate and the cell
 * renderer can drop the now-redundant per-cell anchor.
 */
const TableLinkColumnContext = createContext<number | undefined>(undefined);

export default TableLinkColumnContext;
