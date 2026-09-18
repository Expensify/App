/**
 * Web keeps its Skia/CanvasKit surface across tab visibility changes, so there is nothing to recover
 * from — returning a constant keeps the `key` stable and the canvas mounted. See index.native.ts.
 */
function useSkiaCanvasRemountKey(): number {
    return 0;
}

export default useSkiaCanvasRemountKey;
