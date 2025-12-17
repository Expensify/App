import TableComponent from './Table';
import TableBody from './TableBody';
import TableContext from './TableContext';
import TableFilterButtons from './TableFilterButtons';
import TableHeader from './TableHeader';
import TableHeaderContainer from './TableHeaderContainer';
import TableSearchBar from './TableSearchBar';
import TableSortButtons from './TableSortButtons';

const Table = Object.assign(TableComponent, {
    Context: TableContext,
    Header: TableHeader,
    HeaderContainer: TableHeaderContainer,
    Body: TableBody,
    FilterButtons: TableFilterButtons,
    SearchBar: TableSearchBar,
    SortButtons: TableSortButtons,
});

export default Table;
export {useTableContext} from './TableContext';
export type {TableContextValue} from './TableContext';
export type * from './types';
