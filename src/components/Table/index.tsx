import TableComponent from './Table';
import TableBody from './TableBody';
import TableContext from './TableContext';
import TableFilterButtons from './TableFilterButtons';
import TableHeader from './TableHeader';
import TableSearchBar from './TableSearchBar';

const Table = Object.assign(TableComponent, {
    Context: TableContext,
    Header: TableHeader,
    Body: TableBody,
    FilterButtons: TableFilterButtons,
    SearchBar: TableSearchBar,
});

export default Table;
export {useTableContext} from './TableContext';
export type {TableContextValue} from './TableContext';
export type * from './types';
