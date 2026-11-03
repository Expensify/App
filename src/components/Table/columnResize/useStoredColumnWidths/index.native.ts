import type {StoredTableColumnWidths} from '@src/types/onyx/TableColumnWidths';

/** Column resizing is web-only, so native never subscribes to a stored layout. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the parameter exists only to match the web signature
function useStoredColumnWidths(columnResizingID: string): StoredTableColumnWidths | undefined {
    return undefined;
}

export default useStoredColumnWidths;
