/**
 * `LoadSkiaWeb` must not cache a failed init for the rest of the session, and must name the cause when the glue and the
 * wasm come from different releases (https://github.com/Expensify/App/issues/102042). Both used to be an App patch and
 * are part of react-native-skia since 2.15.4, so these tests guard the behavior across upgrades.
 */
import type {LoadSkiaWeb as LoadSkiaWebFn} from 'react-native-skia/lib/module/web/LoadSkiaWeb';

// Stands in for canvaskit-wasm's default export (`CanvasKitInit`). It resolves with a plain object rather than a real
// `CanvasKit`, because the loader only stores what it is given.
const mockCanvasKitInit = jest.fn<Promise<unknown>, [unknown]>();

// Each test needs a fresh module so the module-level `ckSharedPromise` starts out empty.
async function importLoadSkiaWeb(): Promise<typeof LoadSkiaWebFn> {
    jest.resetModules();
    jest.doMock('canvaskit-wasm/bin/full/canvaskit', () => mockCanvasKitInit);
    const {LoadSkiaWeb} = await import('react-native-skia/lib/module/web/LoadSkiaWeb');
    return LoadSkiaWeb;
}

// The loader publishes whatever CanvasKit resolves with, so the tests only check that this same object comes back.
const usableCanvasKit = {};

describe('LoadSkiaWeb', () => {
    afterEach(() => {
        delete (globalThis as {CanvasKit?: unknown}).CanvasKit;
        jest.clearAllMocks();
    });

    it('should publish CanvasKit globally once it initializes', async () => {
        // Given CanvasKit initializes normally
        mockCanvasKitInit.mockResolvedValue(usableCanvasKit);
        const LoadSkiaWeb = await importLoadSkiaWeb();

        // When Skia is loaded
        await LoadSkiaWeb({});

        // Then the module is stored where Skia.web.ts picks it up
        expect(globalThis.CanvasKit).toBe(usableCanvasKit);
    });

    it('should retry initialization on the next load after the init itself rejected', async () => {
        // Given the first init rejected, as it does on a LinkError or a failed wasm download
        const linkError = new Error('Aborted(LinkError: WebAssembly.instantiate(): Import #238 "a" "wd": function import requires a callable)');
        mockCanvasKitInit.mockRejectedValueOnce(linkError).mockResolvedValueOnce(usableCanvasKit);
        const LoadSkiaWeb = await importLoadSkiaWeb();

        // When a chart loads Skia, and then another chart mounts and loads it again
        const firstLoadError: unknown = await LoadSkiaWeb({}).catch((error: unknown) => error);
        await LoadSkiaWeb({});

        // Then the first failure names the version mismatch instead of the raw linker abort, the rejection was not
        // cached, and the second attempt succeeds
        expect(firstLoadError).toBeInstanceOf(Error);
        expect(firstLoadError instanceof Error ? firstLoadError.message : '').toContain("doesn't match the canvaskit.js bundled with react-native-skia");
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
