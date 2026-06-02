/**
 * Probes whether the current web environment can create a usable WebGL/Skia surface.
 *
 * CanvasKit (the Skia web backend loaded by `WithSkiaWeb`) reads `.rangeMin`/`.rangeMax` off the
 * result of `gl.getShaderPrecisionFormat()` without null-checking it. Per the WebGL spec that call
 * returns `null` when no precision format is available (software/blocklisted GPUs, lost contexts,
 * headless setups), which makes CanvasKit throw an uncaught
 * `TypeError: Cannot read properties of null (reading 'rangeMin')` during its async GL init.
 *
 * Running the same capability probe up front lets callers skip Skia entirely on such devices.
 * The result is memoized because device capability does not change within a session.
 */
let cachedResult: boolean | undefined;

function isSkiaWebSupported(): boolean {
    if (cachedResult !== undefined) {
        return cachedResult;
    }

    try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | WebGL2RenderingContext | null;
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
