import TableComponent from './Table';
import TableBody from './TableBody';
import type {TableContextType} from './TableContext';
import TableFilterButtons from './TableFilterButtons';
import TableHeader from './TableHeader';
import TableSearchBar from './TableSearchBar';
import TableSortButtons from './TableSortButtons';

// Define the compound component type
type TableComponentType<T> = typeof TableComponent & {
    Context: TableContextType<T>;
    Header: typeof TableHeader;
    Body: typeof TableBody<T>;
    FilterButtons: typeof TableFilterButtons;
    SearchBar: typeof TableSearchBar;
    SortButtons: typeof TableSortButtons;
};

const Table = TableComponent as TableComponentType<T>;

Table.Header = TableHeader;
Table.Body = TableBody;
Table.FilterButtons = TableFilterButtons;
Table.SearchBar = TableSearchBar;
Table.SortButtons = TableSortButtons;

export default Table;
export {useTableContext} from './TableContext';
export type {TableContextValue} from './TableContext';
export type * from './types';
