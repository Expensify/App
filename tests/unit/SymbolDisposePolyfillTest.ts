import installDisposeSymbols from '@src/polyfills/SymbolDispose.web';
import type {DisposeSymbolHost} from '@src/polyfills/SymbolDispose.web';

/** Without a native symbol, `[Symbol.dispose]` coerces to the key "undefined" */
function toPropertyKey(disposeSymbol: symbol | undefined): PropertyKey {
    return disposeSymbol ?? 'undefined';
}

/** Mirrors Skia's web BaseHostObject: method key read once, `dispose()` rereads `Symbol.dispose` on every call */
function createSkiaStyleHostObject(symbolHost: DisposeSymbolHost, cleanup: () => void) {
    const hostObject = {
        dispose() {
            const method: unknown = Reflect.get(hostObject, toPropertyKey(symbolHost.dispose));
            if (typeof method !== 'function') {
                throw new TypeError('this[Symbol.dispose] is not a function');
            }
            cleanup();
        },
    };
    Reflect.set(hostObject, toPropertyKey(symbolHost.dispose), cleanup);
    return hostObject;
}

describe('SymbolDispose polyfill', () => {
    it('installs the registered symbols when the engine lacks them', () => {
        // Given an engine without Symbol.dispose. Node has it natively, so use a fake constructor
        const fakeSymbol: DisposeSymbolHost = {};

        // When the polyfill runs
        installDisposeSymbols(fakeSymbol);

        // Then both are the registered symbols Babel and tslib fall back to
        expect(fakeSymbol.dispose).toBe(Symbol.for('Symbol.dispose'));
        expect(fakeSymbol.asyncDispose).toBe(Symbol.for('Symbol.asyncDispose'));
    });

    it('ignores a later script reassigning the symbol', () => {
        // Given the polyfill has installed Symbol.dispose
        const fakeSymbol: DisposeSymbolHost = {};
        installDisposeSymbols(fakeSymbol);

        // When a later script tries to replace it
        const wasReassigned = Reflect.set(fakeSymbol, 'dispose', Symbol('late'));
        const wasRedefined = Reflect.defineProperty(fakeSymbol, 'dispose', {value: Symbol('late')});

        // Then both attempts are rejected
        expect(wasReassigned).toBe(false);
        expect(wasRedefined).toBe(false);
        expect(fakeSymbol.dispose).toBe(Symbol.for('Symbol.dispose'));
    });

    it('leaves an existing native symbol untouched', () => {
        // Given native symbols, which are non-writable and non-configurable
        const nativeDispose = Symbol('native dispose');
        const nativeAsyncDispose = Symbol('native asyncDispose');
        const fakeSymbol: DisposeSymbolHost = {};
        Object.defineProperty(fakeSymbol, 'dispose', {value: nativeDispose, writable: false, configurable: false});
        Object.defineProperty(fakeSymbol, 'asyncDispose', {value: nativeAsyncDispose, writable: false, configurable: false});
        const nativeDescriptor = Object.getOwnPropertyDescriptor(fakeSymbol, 'dispose');

        // When the polyfill runs
        installDisposeSymbols(fakeSymbol);

        // Then symbols and descriptors are unchanged
        expect(fakeSymbol.dispose).toBe(nativeDispose);
        expect(fakeSymbol.asyncDispose).toBe(nativeAsyncDispose);
        expect(Object.getOwnPropertyDescriptor(fakeSymbol, 'dispose')).toEqual(nativeDescriptor);
    });

    it('keeps and locks a writable symbol installed by an earlier script', () => {
        // Given an earlier script (e.g. an extension) defined a writable Symbol.dispose
        const earlyDispose = Symbol('early');
        const fakeSymbol: DisposeSymbolHost = {dispose: earlyDispose};

        // When the polyfill runs and a later script tries to replace it
        installDisposeSymbols(fakeSymbol);
        const wasReassigned = Reflect.set(fakeSymbol, 'dispose', Symbol('late'));

        // Then the early symbol is kept and the replacement is rejected
        expect(wasReassigned).toBe(false);
        expect(fakeSymbol.dispose).toBe(earlyDispose);
    });

    it('reproduces the Skia key mismatch when the polyfill did not run', () => {
        // Given no Symbol.dispose, so a Skia-style object keys its method as "undefined"
        const fakeSymbol: DisposeSymbolHost = {};
        const hostObject = createSkiaStyleHostObject(fakeSymbol, jest.fn());

        // When a later script defines the symbol
        fakeSymbol.dispose = Symbol('late');

        // Then dispose() throws the Sentry error
        expect(() => hostObject.dispose()).toThrow('this[Symbol.dispose] is not a function');
    });

    it('keeps a Skia-style dispose() delegation working after an attempted reassignment', () => {
        // Given the polyfill ran before a Skia-style object was created
        const fakeSymbol: DisposeSymbolHost = {};
        installDisposeSymbols(fakeSymbol);
        const cleanup = jest.fn();
        const hostObject = createSkiaStyleHostObject(fakeSymbol, cleanup);

        // When a later script tries to replace the symbol and the object is disposed
        Reflect.set(fakeSymbol, 'dispose', Symbol('late'));
        hostObject.dispose();

        // Then the method is still found
        expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('keeps a Skia-style dispose() working when an early symbol is later overwritten', () => {
        // Given an early writable symbol, then the polyfill, then a Skia-style object
        const fakeSymbol: DisposeSymbolHost = {dispose: Symbol('early')};
        installDisposeSymbols(fakeSymbol);
        const cleanup = jest.fn();
        const hostObject = createSkiaStyleHostObject(fakeSymbol, cleanup);

        // When a later script tries to replace the symbol and the object is disposed
        Reflect.set(fakeSymbol, 'dispose', Symbol('late'));
        hostObject.dispose();

        // Then the method is still found
        expect(cleanup).toHaveBeenCalledTimes(1);
    });
});
