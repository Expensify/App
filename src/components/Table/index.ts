import TableComponent from './Table';
import TableBody from './TableBody';
import type TableContext from './TableContext';
import TableFilterButtons from './TableFilterButtons';
import TableHeader from './TableHeader';
import TableSearchBar from './TableSearchBar';
import TableSortButtons from './TableSortButtons';

// Define the compound component type
type TableComponentType = typeof TableComponent & {
    Context: typeof TableContext;
    Header: typeof TableHeader;
    Body: typeof TableBody;
    FilterButtons: typeof TableFilterButtons;
    SearchBar: typeof TableSearchBar;
    SortButtons: typeof TableSortButtons;
};

// Attach sub-components to Table for compositional API
const Table = TableComponent as TableComponentType;
Table.Header = TableHeader;
Table.Body = TableBody;
Table.FilterButtons = TableFilterButtons;
Table.SearchBar = TableSearchBar;
Table.SortButtons = TableSortButtons;

export default Table;
export {useTableContext} from './TableContext';
export type {FilterConfig, SortByConfig, TableContextValue} from './TableContext';
