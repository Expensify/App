/**
 * Detects whether the current browser can create a WebGL2 rendering context.
 *
 * Skia (CanvasKit) hard-throws `failed to create webgl context: err 0` from inside its asynchronous draw loop when no
 * WebGL2 context is available — hardware acceleration is disabled, the GPU is on the browser's blocklist, or the per-page
 * live-WebGL-context limit is exhausted. Because that throw happens on a requestAnimationFrame/setTimeout callback it
 * cannot be caught by a synchronous try/catch or a React error boundary, so it escapes as an unhandled error. We precheck
 * with this helper before mounting any Skia-backed chart and degrade gracefully when WebGL2 is unavailable.
 *
 * The probe context is released immediately via the `WEBGL_lose_context` extension so the check itself does not consume
 * one of the browser's limited WebGL context slots, and the result is memoized because GPU capability does not change
 * within a session — the probe therefore runs at most once.
 */
let cachedResult: boolean | undefined;

function isWebGLAvailable(): boolean {
    if (cachedResult !== undefined) {
        return cachedResult;
    }

    if (typeof document === 'undefined') {
        cachedResult = false;
        return cachedResult;
    }

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');
        if (!gl) {
            cachedResult = false;
            return cachedResult;
        }
        // Release the probe context right away so it does not count against the browser's live WebGL context limit.
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        cachedResult = true;
    } catch {
        cachedResult = false;
    }

    return cachedResult;
}

export default isWebGLAvailable;
