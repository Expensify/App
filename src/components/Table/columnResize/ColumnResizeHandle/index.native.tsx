import type {ColumnResizeHandleProps} from '@components/Table/columnResize/types';

/** No-op on native. Keeps the DOM-only implementation out of the native bundle. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the props exist only to match the web signature
function ColumnResizeHandle(props: ColumnResizeHandleProps) {
    return null;
}

export default ColumnResizeHandle;
