/**
 * Probes whether the current web environment can create a usable WebGL/Skia surface.
 *
 * CanvasKit (loaded by `WithSkiaWeb`) reads `.rangeMin` off `gl.getShaderPrecisionFormat()` without a
 * null check. That call returns `null` per spec on incapable GPUs / lost contexts, so CanvasKit throws
 * an uncaught `TypeError: Cannot read properties of null (reading 'rangeMin')` during its async GL init.
 * Probing up front lets callers skip Skia there. Memoized since device capability is stable per session.
 */
let cachedResult: boolean | undefined;

function isSkiaWebSupported(): boolean {
    if (cachedResult !== undefined) {
        return cachedResult;
    }

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
        if (!gl) {
            cachedResult = false;
            return cachedResult;
        }
        cachedResult = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT) !== null;
    } catch {
        cachedResult = false;
    }

    return cachedResult;
}

export default isSkiaWebSupported;
