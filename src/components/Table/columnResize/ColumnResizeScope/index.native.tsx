import type {ColumnResizeScopeProps} from '@components/Table/columnResize/types';

/** No-op on native: there are no resizable columns, so children render as-is. */
function ColumnResizeScope({children}: ColumnResizeScopeProps) {
    return children;
}

export default ColumnResizeScope;
