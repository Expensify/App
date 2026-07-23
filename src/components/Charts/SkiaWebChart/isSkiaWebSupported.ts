/**
 * Probes whether the current web environment can give Skia/CanvasKit a usable WebGL surface.
 *
 * The probe reuses a single long-lived WebGL context instead of creating a throwaway one on every
 * chart mount. Creating and discarding a context per mount churns WebGL contexts, and on
 * context-constrained mobile browsers (e.g. Android Chrome) that pressure can crash the shared GPU
 * process; afterwards every `getShaderPrecisionFormat` returns `null` and a perfectly capable device
 * wrongly shows the "unable to display chart" empty state. Reusing one context avoids that while
 * still re-checking on each mount, so an overridden or lost context is still detected.
 */
let probeContext: WebGL2RenderingContext | WebGLRenderingContext | null | undefined;

function getProbeContext(): WebGL2RenderingContext | WebGLRenderingContext | null {
    if (probeContext && !probeContext.isContextLost()) {
        return probeContext;
    }
    const canvas = document.createElement('canvas');
    probeContext = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    return probeContext;
}

function isSkiaWebSupported(): boolean {
    try {
        const gl = getProbeContext();
        // No WebGL context available right now is usually transient GPU pressure, not a real capability
        // verdict — let Skia try and re-check on the next mount instead of blocking a capable device.
        if (!gl) {
            return true;
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
