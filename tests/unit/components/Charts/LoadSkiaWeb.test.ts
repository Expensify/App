/**
 * Covers patches/@shopify/react-native-skia/@shopify+react-native-skia+2.11.2+004+load-skia-web-fail-closed.patch.
 * `LoadSkiaWeb` must refuse a CanvasKit that initialized without its bindings (glue and wasm from different releases,
 * https://github.com/Expensify/App/issues/102042) and must not cache a failed init for the rest of the session.
 */
import type {LoadSkiaWeb as LoadSkiaWebFn} from '@shopify/react-native-skia/lib/module/web/LoadSkiaWeb';

// Stands in for canvaskit-wasm's default export (`CanvasKitInit`). Typed loosely on purpose: the tests hand back
// deliberately malformed modules that the real `CanvasKit` type would reject.
const mockCanvasKitInit = jest.fn<Promise<unknown>, [unknown]>();

// Each test needs a fresh module so the module-level `ckSharedPromise` starts out empty.
async function importLoadSkiaWeb(): Promise<typeof LoadSkiaWebFn> {
    jest.resetModules();
    jest.doMock('canvaskit-wasm/bin/full/canvaskit', () => mockCanvasKitInit);
    const {LoadSkiaWeb} = await import('@shopify/react-native-skia/lib/module/web/LoadSkiaWeb');
    return LoadSkiaWeb;
}

// A CanvasKit that finished initializing registers its classes (PictureRecorder, Paint, ...) as constructors;
// the patched loader only checks `typeof`, so plain functions are enough here.
const usableCanvasKit = {PictureRecorder: () => {}, Paint: () => {}};

// Old glue linked against a newer binary resolves an object carrying only the glue's own JS helpers.
const canvasKitWithoutBindings = {Color: () => 0, Malloc: () => 0};

describe('LoadSkiaWeb', () => {
    afterEach(() => {
        delete (globalThis as {CanvasKit?: unknown}).CanvasKit;
        jest.clearAllMocks();
    });

    it('should publish CanvasKit globally once it initializes with its bindings', async () => {
        // Given CanvasKit initializes normally
        mockCanvasKitInit.mockResolvedValue(usableCanvasKit);
        const LoadSkiaWeb = await importLoadSkiaWeb();

        // When Skia is loaded
        await LoadSkiaWeb({});

        // Then the module is stored where Skia.web.ts picks it up
        expect(globalThis.CanvasKit).toBe(usableCanvasKit);
    });

    it('should reject and keep the global unset when CanvasKit initializes without its bindings', async () => {
        // Given the glue linked against a mismatched binary, so init resolves but no classes were registered
        mockCanvasKitInit.mockResolvedValue(canvasKitWithoutBindings);
        const LoadSkiaWeb = await importLoadSkiaWeb();

        // When Skia is loaded
        const result = LoadSkiaWeb({});

        // Then the load fails at this point, where WithSkiaWeb's lazy() surfaces it to the chart's error boundary,
        // rather than publishing a module whose first `new CanvasKit.PictureRecorder()` would throw from a worklet
        await expect(result).rejects.toThrow('CanvasKit initialized without its bindings');
        expect(globalThis.CanvasKit).toBeUndefined();
    });

    it('should retry initialization on the next load after a failed check instead of caching the failure', async () => {
        // Given the first init produced a CanvasKit without bindings
        mockCanvasKitInit.mockResolvedValueOnce(canvasKitWithoutBindings).mockResolvedValueOnce(usableCanvasKit);
        const LoadSkiaWeb = await importLoadSkiaWeb();
        await expect(LoadSkiaWeb({})).rejects.toThrow();

        // When another chart mounts and loads Skia again
        await LoadSkiaWeb({});

        // Then CanvasKit is initialized afresh (e.g. after the stale binary was evicted) and published
        expect(mockCanvasKitInit).toHaveBeenCalledTimes(2);
        expect(globalThis.CanvasKit).toBe(usableCanvasKit);
    });

    it('should retry initialization on the next load after the init itself rejected', async () => {
        // Given the first init rejected, as it does on a LinkError or a failed wasm download
        const linkError = new Error('Aborted(LinkError: WebAssembly.instantiate(): Import #238 "a" "wd": function import requires a callable)');
        mockCanvasKitInit.mockRejectedValueOnce(linkError).mockResolvedValueOnce(usableCanvasKit);
        const LoadSkiaWeb = await importLoadSkiaWeb();
        await expect(LoadSkiaWeb({})).rejects.toBe(linkError);

        // When another chart mounts and loads Skia again
        await LoadSkiaWeb({});

        // Then the rejection was not cached and the second attempt succeeds
        expect(mockCanvasKitInit).toHaveBeenCalledTimes(2);
        expect(globalThis.CanvasKit).toBe(usableCanvasKit);
    });

    it('should not initialize again once CanvasKit is already available', async () => {
        // Given CanvasKit was already published by an earlier load
        (globalThis as {CanvasKit?: unknown}).CanvasKit = usableCanvasKit;
        const LoadSkiaWeb = await importLoadSkiaWeb();

        // When Skia is loaded again
        await LoadSkiaWeb({});

        // Then the existing module is reused
        expect(mockCanvasKitInit).not.toHaveBeenCalled();
    });
});
