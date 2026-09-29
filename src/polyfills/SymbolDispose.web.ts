import type {TupleToUnion} from 'type-fest';

/**
 * Polyfill for Symbol.dispose and Symbol.asyncDispose, missing in Safari, Firefox < 141 and Chrome < 125.
 *
 * Skia's web host objects key a `[Symbol.dispose]()` method once at load, but `dispose()` reads `Symbol.dispose` on every call.
 * If a script changes `Symbol.dispose` after Skia loads, the keys stop matching and every chart frame throws.
 * Locking the symbols before Skia loads (like the native descriptor) keeps them in sync. An earlier configurable symbol is kept but locked.
 *
 * See https://github.com/Expensify/App/issues/102043.
 */
const DISPOSE_SYMBOL_NAMES = ['dispose', 'asyncDispose'] as const;

type DisposeSymbolHost = Partial<Record<TupleToUnion<typeof DISPOSE_SYMBOL_NAMES>, symbol>>;

function installDisposeSymbols(symbolConstructor: DisposeSymbolHost) {
    for (const name of DISPOSE_SYMBOL_NAMES) {
        const existing = Object.getOwnPropertyDescriptor(symbolConstructor, name);
        if (existing && !existing.configurable) {
            // Native, or already locked: nothing to do
            continue;
        }
        const currentValue = symbolConstructor[name];
        Object.defineProperty(symbolConstructor, name, {
            // Keep an earlier script's symbol. Babel and tslib fall back to the registered one
            value: typeof currentValue === 'symbol' ? currentValue : Symbol.for(`Symbol.${name}`),
            writable: false,
            configurable: false,
            enumerable: false,
        });
    }
}

installDisposeSymbols(Symbol);

export default installDisposeSymbols;
export type {DisposeSymbolHost};
