/**
 * Probes whether the current web environment can create a usable WebGL/Skia surface.
 *
 * CanvasKit (loaded by `WithSkiaWeb`) reads `.rangeMin` off `gl.getShaderPrecisionFormat()` without a
 * null check. That call returns `null` per spec on incapable GPUs / lost contexts, so CanvasKit throws
 * an uncaught `TypeError: Cannot read properties of null (reading 'rangeMin')` during its async GL init.
 * Running the same call up front lets callers skip Skia there. Callers probe once per chart mount
 * (not memoized for the whole session) so a context lost mid-session is caught too; the throwaway
 * probe context is released immediately so it can't evict a real chart's context.
 */
function isSkiaWebSupported(): boolean {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
        if (!gl) {
            return false;
        }
        const supported = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT) !== null;
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return supported;
    } catch {
        return false;
    }
}

export default isSkiaWebSupported;
