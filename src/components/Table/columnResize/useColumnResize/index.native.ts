import type {ColumnResizeController, UseColumnResizeParams} from './types';

/** Column resizing is web-only. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the parameter exists only to match the web signature
function useColumnResize(params: UseColumnResizeParams): ColumnResizeController | undefined {
    return undefined;
}

export default useColumnResize;
