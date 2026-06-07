import isSkiaWebSupported from '@components/Charts/SkiaWebChart/isSkiaWebSupported';

type GLStub = {
    FRAGMENT_SHADER: number;
    HIGH_FLOAT: number;
    getShaderPrecisionFormat: jest.Mock;
    getExtension: jest.Mock;
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
        getExtension: jest.fn(() => ({loseContext: jest.fn()})),
    };
}

function mockCanvas(getContext: jest.Mock) {
    return jest.spyOn(document, 'createElement').mockReturnValue({getContext} as unknown as HTMLCanvasElement);
}

describe('isSkiaWebSupported', () => {
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

    it('should return false when the context cannot provide a shader precision format', () => {
        // This is the actual crash scenario: getShaderPrecisionFormat returns null, which CanvasKit would deref.
        mockCanvas(jest.fn(() => makeGl(null)));

        expect(isSkiaWebSupported()).toBe(false);
    });

    it('should return false when no WebGL context is available', () => {
        mockCanvas(jest.fn(() => null));

        expect(isSkiaWebSupported()).toBe(false);
    });

    it('should return false when probing throws', () => {
        jest.spyOn(document, 'createElement').mockImplementation(() => {
            throw new Error('createElement blew up');
        });

        expect(isSkiaWebSupported()).toBe(false);
    });

    it('should re-probe on each call so a context lost mid-session is detected', () => {
        const gl = makeGl(VALID_FORMAT);
        mockCanvas(jest.fn(() => gl));

        expect(isSkiaWebSupported()).toBe(true);

        // The same context can no longer provide a precision format (e.g. the WebGL context was lost).
        gl.getShaderPrecisionFormat.mockReturnValue(null);
        expect(isSkiaWebSupported()).toBe(false);
    });

    it('should release the throwaway probe context after checking', () => {
        const loseContext = jest.fn();
        const gl = makeGl(VALID_FORMAT);
        gl.getExtension.mockReturnValue({loseContext});
        mockCanvas(jest.fn(() => gl));

        isSkiaWebSupported();

        expect(gl.getExtension).toHaveBeenCalledWith('WEBGL_lose_context');
        expect(loseContext).toHaveBeenCalled();
    });
});
