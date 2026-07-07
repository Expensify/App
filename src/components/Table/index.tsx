/**
 * Table Component
 *
 * A composable table component with built-in filtering, search, and sorting.
 * Uses a compound component pattern for flexible UI composition.
 *
 * @example Basic Usage
 * ```tsx
 * import Table from '@components/Table';
 *
 * <Table data={items} columns={columns} renderItem={renderItem}>
 *   <Table.Header />
 *   <Table.Body />
 * </Table>
 * ```
 *
 * @example Full Featured
 * ```tsx
 * <Table
 *   data={items}
 *   columns={columns}
 *   renderItem={renderItem}
 *   isItemInSearch={searchFn}
 *   compareItems={compareFn}
 *   filters={filterConfig}
 *   isItemInFilter={filterFn}
 * >
 *   <Table.FilterBar />
 *   <Table.Header />
 *   <Table.Body />
 * </Table>
 * ```
 *
 * See README.md in this directory for full documentation.
 */
import TableComponent from './Table';
import TableBody from './TableBody';
import TableContext from './TableContext';
import TableFilterBar from './TableFilterBar';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

/**
 * Table compound component with attached sub-components.
 *
 * Sub-components:
 * - `Table.Context` - The React context (for advanced usage)
 * - `Table.Header` - Sortable column headers
 * - `Table.Body` - Data rows using FlashList
 * - `Table.FilterBar` - Search input & filter bar
 */
const Table = Object.assign(TableComponent, {
    /** The React context for accessing table state directly. */
    Context: TableContext,

    /** Renders sortable column headers. */
    Header: TableHeader,

    /** Renders data rows using FlashList. */
    Body: TableBody,

    /** Renders a row in the table */
    Row: TableRow,

    /** The filter bar with a searchbar/filters menu */
    FilterBar: TableFilterBar,
});

export default Table;
export type * from './types';
