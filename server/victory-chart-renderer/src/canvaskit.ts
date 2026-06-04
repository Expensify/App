import type {CanvasKitInitOptions} from 'canvaskit-wasm';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import canvaskitWasmPath from '../../../node_modules/canvaskit-wasm/bin/full/canvaskit.wasm' with {type: 'file'};

const require = createRequire(import.meta.url);

let cachedWasmBinary: Uint8Array | undefined;

function getCanvaskitWasmPathFromNodeModules(): string {
    return join(dirname(require.resolve('canvaskit-wasm/bin/full/canvaskit.js')), 'canvaskit.wasm');
}

async function loadCanvaskitWasmBinary(): Promise<Uint8Array> {
    const embeddedFile = Bun.file(canvaskitWasmPath);
    if (await embeddedFile.exists()) {
        return new Uint8Array(await embeddedFile.arrayBuffer());
    }

    // Dev bundle (`scripts/dev.ts`) runs with cwd at the App root; the hashed asset path is not on disk.
    return new Uint8Array(await Bun.file(getCanvaskitWasmPathFromNodeModules()).arrayBuffer());
}

/**
 * CanvasKit init options for headless Skia.
 *
 * Bun compile bakes canvaskit's default `__dirname` from the build machine, so file-based
 * loading breaks on other hosts. We embed canvaskit.wasm in compiled executables and pass
 * `wasmBinary` so CanvasKit never touches the filesystem. Dev falls back to node_modules.
 */
export async function getCanvaskitInitOptions(): Promise<CanvasKitInitOptions> {
    if (!cachedWasmBinary) {
        cachedWasmBinary = await loadCanvaskitWasmBinary();
    }

    return {
        wasmBinary: cachedWasmBinary,
    };
}
