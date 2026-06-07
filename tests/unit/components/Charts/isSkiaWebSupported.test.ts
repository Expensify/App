import isSkiaWebSupportedDefault from '@components/Charts/SkiaWebChart/isSkiaWebSupported';

type IsSkiaWebSupported = typeof isSkiaWebSupportedDefault;

type GLStub = {
    FRAGMENT_SHADER: number;
    HIGH_FLOAT: number;
    getShaderPrecisionFormat: jest.Mock;
};

// Real WebGL enum values; the stubbed `getShaderPrecisionFormat` ignores them but keeps the call self-documenting.
const FRAGMENT_SHADER = 0x8b30;
const HIGH_FLOAT = 0x8df2;
const VALID_FORMAT: WebGLShaderPrecisionFormat = {rangeMin: 127, rangeMax: 127, precision: 23};

function makeGl(format: WebGLShaderPrecisionFormat | null): GLStub {
    return {
        FRAGMENT_SHADER,
        HIGH_FLOAT,
        getShaderPrecisionFormat: jest.fn(() => format),
    };
}

function mockCanvas(getContext: jest.Mock) {
    return jest.spyOn(document, 'createElement').mockReturnValue({getContext} as unknown as HTMLCanvasElement);
}

/** Loads a fresh copy of the module so its internal memo cache is reset between cases. */
function loadFresh(): IsSkiaWebSupported {
    let loaded: IsSkiaWebSupported = isSkiaWebSupportedDefault;
    jest.isolateModules(() => {
        loaded = (require('@components/Charts/SkiaWebChart/isSkiaWebSupported') as {default: IsSkiaWebSupported}).default;
    });
    return loaded;
}

describe('isSkiaWebSupported', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return true when the WebGL2 context reports a shader precision format', () => {
        const gl = makeGl(VALID_FORMAT);
        mockCanvas(jest.fn((contextId: string) => (contextId === 'webgl2' ? gl : null)));

        expect(loadFresh()()).toBe(true);
        expect(gl.getShaderPrecisionFormat).toHaveBeenCalledWith(FRAGMENT_SHADER, HIGH_FLOAT);
    });

    it('should fall back to the WebGL1 context when WebGL2 is unavailable', () => {
        const gl = makeGl(VALID_FORMAT);
        mockCanvas(jest.fn((contextId: string) => (contextId === 'webgl' ? gl : null)));

        expect(loadFresh()()).toBe(true);
    });

    it('should return false when the context cannot provide a shader precision format', () => {
        // This is the actual crash scenario: getShaderPrecisionFormat returns null, which CanvasKit would deref.
        mockCanvas(jest.fn(() => makeGl(null)));

        expect(loadFresh()()).toBe(false);
    });

    it('should return false when no WebGL context is available', () => {
        mockCanvas(jest.fn(() => null));

        expect(loadFresh()()).toBe(false);
    });

    it('should return false when probing throws', () => {
        jest.spyOn(document, 'createElement').mockImplementation(() => {
            throw new Error('createElement blew up');
        });

        expect(loadFresh()()).toBe(false);
    });

    it('should memoize the result across calls', () => {
        const gl = makeGl(VALID_FORMAT);
        const createElementSpy = mockCanvas(jest.fn(() => gl));

        const isSkiaWebSupported = loadFresh();
        expect(isSkiaWebSupported()).toBe(true);
        expect(isSkiaWebSupported()).toBe(true);

        expect(createElementSpy).toHaveBeenCalledTimes(1);
        expect(gl.getShaderPrecisionFormat).toHaveBeenCalledTimes(1);
    });
});
