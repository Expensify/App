/// <reference path="../canvaskit-wasm.d.ts" />
import type {CanvasKitInitOptions} from 'canvaskit-wasm';
import canvaskitWasmPath from 'canvaskit-wasm/bin/full/canvaskit.wasm' with {type: 'file'};
import {accessSync, constants} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';

const require = createRequire(import.meta.url);

function getCanvaskitWasmPathFromNodeModules(fileName: string): string {
    return join(dirname(require.resolve('canvaskit-wasm/bin/full/canvaskit.js')), fileName);
}

/**
 * Resolves canvaskit.wasm for headless Skia.
 *
 * Bun compile bakes canvaskit's `__dirname` from the build machine, so the default loader
 * looks for wasm under that host path. We embed wasm via Bun's file import and override
 * `locateFile` so CanvasKit loads from the embedded asset or node_modules in dev.
 */
function resolveCanvaskitWasmPath(fileName: string): string {
    try {
        accessSync(canvaskitWasmPath, constants.R_OK);
        return canvaskitWasmPath;
    } catch {
        return getCanvaskitWasmPathFromNodeModules(fileName);
    }
}

export function getCanvaskitInitOptions(): CanvasKitInitOptions {
    return {
        locateFile: (file) => resolveCanvaskitWasmPath(file),
    };
}
