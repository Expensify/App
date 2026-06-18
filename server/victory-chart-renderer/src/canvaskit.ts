import type {CanvasKitInitOptions} from 'canvaskit-wasm';
import canvaskitWasmPath from 'canvaskit-wasm/bin/full/canvaskit.wasm' with {type: 'file'};
import {dirname, isAbsolute, join} from 'node:path';

function getEmbeddedCanvaskitWasmPath(): string {
    if (isAbsolute(canvaskitWasmPath)) {
        return canvaskitWasmPath;
    }

    return join(dirname(import.meta.path), canvaskitWasmPath);
}

/**
 * Resolves canvaskit.wasm for headless Skia.
 *
 * Bun compile bakes canvaskit's `__dirname` from the build machine, so the default loader
 * looks for wasm under that host path. We embed wasm via Bun's file import and override
 * `locateFile` so CanvasKit loads from the embedded asset in standalone binaries.
 */
function resolveCanvaskitWasmPath(fileName: string): string {
    if (fileName.endsWith('.wasm')) {
        return getEmbeddedCanvaskitWasmPath();
    }

    throw new Error(`Unexpected CanvasKit asset requested: ${fileName}`);
}

const canvaskitInitOptions: CanvasKitInitOptions = {
    locateFile: resolveCanvaskitWasmPath,
};

export default canvaskitInitOptions;
