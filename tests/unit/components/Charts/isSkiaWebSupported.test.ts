type GLStub = {
    FRAGMENT_SHADER: number;
    HIGH_FLOAT: number;
    getShaderPrecisionFormat: jest.Mock;
    getExtension: jest.Mock;
    isContextLost: jest.Mock;
};

// Real WebGL enum values; the stubbed `getShaderPrecisionFormat` ignores them but keeps the call self-documenting.
const FRAGMENT_SHADER = 0x8b30;
const HIGH_FLOAT = 0x8df2;
const VALID_FORMAT: WebGLShaderPrecisionFormat = {rangeMin: 127, rangeMax: 127, precision: 23};

function makeGl(format: WebGLShaderPrecisionFormat | null, {lost = false}: {lost?: boolean} = {}): GLStub {
    return {
        FRAGMENT_SHADER,
        HIGH_FLOAT,
        getShaderPrecisionFormat: jest.fn(() => format),
        getExtension: jest.fn(() => ({loseContext: jest.fn()})),
        isContextLost: jest.fn(() => lost),
    };
}

// Mock `document.createElement` to hand back canvases whose `getContext` is stubbed. Each entry in
// `getContexts` backs one created canvas; once exhausted the last entry is reused.
function mockCanvases(getContexts: jest.Mock[]) {
    const canvases = getContexts.map((getContext) => {
        const canvas = document.createElement('canvas');
        jest.spyOn(canvas, 'getContext').mockImplementation(getContext);
        return canvas;
    });
    let index = 0;
    return jest.spyOn(document, 'createElement').mockImplementation(() => {
        const canvas = canvases.at(Math.min(index, canvases.length - 1));
        index += 1;
        if (!canvas) {
            throw new Error('mockCanvases: no canvas configured');
        }
        return canvas;
    });
}

function mockCanvas(getContext: jest.Mock) {
    return mockCanvases([getContext]);
}

describe('isSkiaWebSupported', () => {
    let isSkiaWebSupported: () => boolean;

    beforeEach(async () => {
        // The probe caches a long-lived context in module scope, so reset the module between tests.
        jest.resetModules();
        isSkiaWebSupported = (await import('@components/Charts/SkiaWebChart/isSkiaWebSupported')).default;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return true when the WebGL2 context reports a shader precision format', () => {
        const gl = makeGl(VALID_FORMAT);
        mockCanvas(jest.fn((contextId: string) => (contextId === 'webgl2' ? gl : null)));

        expect(isSkiaWebSupported()).toBe(true);
        expect(gl.getShaderPrecisionFormat).toHaveBeenCalledWith(FRAGMENT_SHADER, HIGH_FLOAT);
    });

    it('should fall back to the WebGL1 context when WebGL2 is unavailable', () => {
        const gl = makeGl(VALID_FORMAT);
        mockCanvas(jest.fn((contextId: string) => (contextId === 'webgl' ? gl : null)));

        expect(isSkiaWebSupported()).toBe(true);
    });

    it('should return false when a live context cannot provide a shader precision format', () => {
        // The actual crash scenario: getShaderPrecisionFormat returns null on a context that is NOT lost.
        mockCanvas(jest.fn(() => makeGl(null)));

        expect(isSkiaWebSupported()).toBe(false);
    });

    it('should return true when the null format comes from a lost context (transient, not a verdict)', () => {
        mockCanvas(jest.fn(() => makeGl(null, {lost: true})));

        expect(isSkiaWebSupported()).toBe(true);
    });

    it('should return true when no WebGL context is available (transient GPU pressure, not a verdict)', () => {
        mockCanvas(jest.fn(() => null));

        expect(isSkiaWebSupported()).toBe(true);
    });

    it('should return true when probing throws', () => {
        jest.spyOn(document, 'createElement').mockImplementation(() => {
            throw new Error('createElement blew up');
        });

        expect(isSkiaWebSupported()).toBe(true);
    });

    it('should reuse a single probe context across calls instead of creating one per call', () => {
        // Per-mount context creation churns WebGL contexts and crashes the GPU process on mobile, so the
        // probe must reuse one context.
        const createElement = mockCanvas(jest.fn(() => makeGl(VALID_FORMAT)));

        isSkiaWebSupported();
        isSkiaWebSupported();
        isSkiaWebSupported();

        expect(createElement).toHaveBeenCalledTimes(1);
    });

    it('should re-check the reused context on each call so an overridden context is still detected', () => {
        const gl = makeGl(VALID_FORMAT);
        const createElement = mockCanvas(jest.fn(() => gl));

        expect(isSkiaWebSupported()).toBe(true);

        // The same (reused) context now returns null, e.g. getShaderPrecisionFormat was overridden.
        gl.getShaderPrecisionFormat.mockReturnValue(null);
        expect(isSkiaWebSupported()).toBe(false);
        expect(createElement).toHaveBeenCalledTimes(1);
    });

    it('should recreate the probe context after the previous one is lost', () => {
        const createElement = mockCanvases([jest.fn(() => makeGl(VALID_FORMAT, {lost: true})), jest.fn(() => makeGl(VALID_FORMAT))]);

        isSkiaWebSupported();
        isSkiaWebSupported();

        expect(createElement).toHaveBeenCalledTimes(2);
    });
});
