import type {ColumnResizeHandleProps} from '@components/Table/columnResize/types';

/** No-op on native (no resizable columns there); exists to keep the DOM-only implementation out of the native bundle. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ColumnResizeHandle(props: ColumnResizeHandleProps) {
    return null;
}

export default ColumnResizeHandle;
