/**
 * isWebGLAvailable memoizes its result at module scope, so each test loads a fresh copy inside
 * jest.isolateModules to re-run the probe from a clean state.
 */
function loadIsWebGLAvailable(): () => boolean {
    let probe: () => boolean = () => false;
    jest.isolateModules(() => {
        probe = jest.requireActual<{default: () => boolean}>('@components/Charts/utils/isWebGLAvailable').default;
    });
    return probe;
}

type LoseContextExtension = {loseContext: jest.Mock};

/**
 * Replaces the WebGL context returned by every canvas with the provided mock, so each test can simulate
 * WebGL2 being available, unavailable, or throwing.
 */
function mockGetContext(getContext: jest.Mock): void {
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(getContext);
}

describe('isWebGLAvailable', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns true and releases the probe context when a WebGL2 context is created', () => {
        const loseContext = jest.fn();
        const getExtension = jest.fn((): LoseContextExtension => ({loseContext}));
        const getContext = jest.fn(() => ({getExtension}));
        mockGetContext(getContext);

        const isWebGLAvailable = loadIsWebGLAvailable();

        expect(isWebGLAvailable()).toBe(true);
        expect(getContext).toHaveBeenCalledWith('webgl2');
        expect(getExtension).toHaveBeenCalledWith('WEBGL_lose_context');
        expect(loseContext).toHaveBeenCalledTimes(1);
    });

    it('returns true without throwing when the lose-context extension is unavailable', () => {
        const getContext = jest.fn(() => ({getExtension: jest.fn(() => null)}));
        mockGetContext(getContext);

        const isWebGLAvailable = loadIsWebGLAvailable();

        expect(isWebGLAvailable()).toBe(true);
    });

    it('returns false when no WebGL2 context can be created', () => {
        const getContext = jest.fn(() => null);
        mockGetContext(getContext);

        const isWebGLAvailable = loadIsWebGLAvailable();

        expect(isWebGLAvailable()).toBe(false);
    });

    it('returns false when creating the context throws', () => {
        const getContext = jest.fn(() => {
            throw new Error('WebGL blocked');
        });
        mockGetContext(getContext);

        const isWebGLAvailable = loadIsWebGLAvailable();

        expect(isWebGLAvailable()).toBe(false);
    });

    it('returns false in a non-browser environment where document is undefined', () => {
        const originalDocument = globalThis.document;
        Object.defineProperty(globalThis, 'document', {value: undefined, configurable: true, writable: true});

        try {
            const isWebGLAvailable = loadIsWebGLAvailable();
            expect(isWebGLAvailable()).toBe(false);
        } finally {
            Object.defineProperty(globalThis, 'document', {value: originalDocument, configurable: true, writable: true});
        }
    });

    it('memoizes the result so the probe runs at most once per session', () => {
        const getContext = jest.fn(() => ({getExtension: jest.fn(() => ({loseContext: jest.fn()}))}));
        mockGetContext(getContext);

        const isWebGLAvailable = loadIsWebGLAvailable();

        expect(isWebGLAvailable()).toBe(true);
        expect(isWebGLAvailable()).toBe(true);
        expect(getContext).toHaveBeenCalledTimes(1);
    });
});
