import type {ColumnResizeController, UseColumnResizeParams} from './types';

/** Column resizing is web-only, so native always returns `undefined` and keeps existing widths. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useColumnResize(params: UseColumnResizeParams): ColumnResizeController | undefined {
    return undefined;
}

export default useColumnResize;
