import TableComponent from './Table';
import TableBody from './TableBody';
import type {TableContextType} from './TableContext';
import TableContext from './TableContext';
import TableFilterButtons from './TableFilterButtons';
import TableHeader from './TableHeader';
import TableHeaderContainer from './TableHeaderContainer';
import TableSearchBar from './TableSearchBar';
import TableSortButtons from './TableSortButtons';

// Define the compound component type
type TableComponentType<T, ColumnKey extends string = string> = typeof TableComponent<T, ColumnKey> & {
    Context: TableContextType<unknown>;
    Header: typeof TableHeader;
    HeaderContainer: typeof TableHeaderContainer;
    Body: typeof TableBody;
    FilterButtons: typeof TableFilterButtons;
    SearchBar: typeof TableSearchBar;
    SortButtons: typeof TableSortButtons;
};

const Table = TableComponent as TableComponentType;

Table.Context = TableContext;
Table.Header = TableHeader;
Table.HeaderContainer = TableHeaderContainer;
Table.Body = TableBody;
Table.FilterButtons = TableFilterButtons;
Table.SearchBar = TableSearchBar;
Table.SortButtons = TableSortButtons;

export default Table;
export {useTableContext} from './TableContext';
export type {TableContextValue} from './TableContext';
export type * from './types';
