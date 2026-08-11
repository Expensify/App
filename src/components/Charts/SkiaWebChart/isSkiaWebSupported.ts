/**
 * Probes whether the current web environment can give Skia/CanvasKit a usable WebGL surface, so callers
 * can show an empty state instead of mounting Skia and hitting one of its async crashes that no try/catch
 * can stop: CanvasKit asks for a WebGL2 context (never falling back to WebGL1 once the WebGL2 API exists) and
 * throws `failed to create webgl context` when it can't create one, and it reads `.rangeMin` off
 * `getShaderPrecisionFormat()` without a null check, throwing on GPUs that return `null` there.
 *
 * The probe reuses a single long-lived context instead of creating one per chart mount: that per-mount
 * churn pressures context-constrained mobile browsers (e.g. Android Chrome) into losing contexts, after
 * which `getShaderPrecisionFormat` returns `null` and a capable device wrongly shows the empty state.
 */
let probeContext: WebGL2RenderingContext | WebGLRenderingContext | null | undefined;

function getProbeContext(): WebGL2RenderingContext | WebGLRenderingContext | null {
    if (probeContext && !probeContext.isContextLost()) {
        return probeContext;
    }
    const canvas = document.createElement('canvas');
    // Mirror CanvasKit: it asks for WebGL2 whenever the WebGL2 API exists and never falls back to WebGL1,
    // so probing WebGL1 would green-light a context the renderer can't actually use.
    probeContext = typeof WebGL2RenderingContext !== 'undefined' ? canvas.getContext('webgl2') : canvas.getContext('webgl');
    return probeContext;
}

function isSkiaWebSupported(): boolean {
    try {
        const gl = getProbeContext();
        // The context CanvasKit needs can't be created, so it would throw `failed to create webgl context`.
        // Skip Skia; SkiaWebChart re-probes on the next mount, so a transient failure still recovers.
        if (!gl) {
            return false;
        }
        const precisionFormat = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        // A lost context also returns `null` here, but that's transient, so don't treat it as a verdict.
        if (precisionFormat === null && gl.isContextLost()) {
            return true;
        }
        return precisionFormat !== null;
    } catch {
        return true;
    }
}

export default isSkiaWebSupported;
