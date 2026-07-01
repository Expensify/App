/**
 * Detects whether the current browser can create a WebGL2 rendering context.
 *
 * Skia (CanvasKit) hard-throws `failed to create webgl context: err 0` from inside its async draw loop when WebGL2 is
 * unavailable (e.g. hardware acceleration disabled, the GPU is blocked, or the per-page live-context limit exhausted).
 * That throw lands on a requestAnimationFrame/setTimeout callback, so no synchronous try/catch or React error boundary
 * can catch it — checking for it first lets a Skia-backed chart degrade gracefully instead of crashing.
 *
 * The result is memoized because GPU capability does not change within a session.
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
