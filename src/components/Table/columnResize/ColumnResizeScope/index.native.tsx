import type {ColumnResizeScopeProps} from '@components/Table/columnResize/types';

/** No-op on native. */
function ColumnResizeScope({children}: ColumnResizeScopeProps) {
    return children;
}

export default ColumnResizeScope;
