import type {Locale} from '@src/CONST/LOCALES';
import type IntlStore from '@src/languages/IntlStore';
import type {FlatTranslationsObject, TranslationPaths} from '@src/languages/types';

/** The part of the store the UI suites touch. Widening the real class's public surface breaks this type until the mock catches up. */
type MockedIntlStore = Pick<typeof IntlStore, 'getCurrentLocale' | 'load' | 'get' | 'subscribe' | 'getSnapshot' | 'hasLocale'>;

/**
 * Builds the `jest.mock('@src/languages/IntlStore')` replacement for suites that need real translations but not the
 * async loader. Call it from inside the factory, which is hoisted above imports and so cannot close over anything:
 *
 *     jest.mock('@src/languages/IntlStore', () => ({__esModule: true, default: require('../../utils/createIntlStoreMock').default()}));
 *
 * Typed against the real store, so a field added there (`isCurrentLocaleLoaded` was one) fails to compile here rather than
 * reading `undefined` in each hand-rolled copy of this shape.
 */
export default function createIntlStoreMock(locale: Locale = 'en'): MockedIntlStore {
    // `require` is untyped here on purpose: a jest.mock factory is hoisted above imports, so these cannot be `import`s.
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const translations: Record<string, unknown> = require('@src/languages/en').default;
    const flattenObject: (obj: Record<string, unknown>) => FlatTranslationsObject = require('@src/languages/flattenObject').default;
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const cache = new Map<Locale, FlatTranslationsObject>([[locale, flattenObject(translations)]]);
    const listeners = new Set<() => void>();
    let currentLocale = locale;
    let snapshot = {locale: currentLocale, isCurrentLocaleLoaded: cache.has(currentLocale)};

    return {
        getCurrentLocale: () => currentLocale,
        load: (requestedLocale?: Locale) => {
            if (requestedLocale && !cache.has(requestedLocale)) {
                throw new Error(`[createIntlStoreMock] no seed for "${requestedLocale}", so this switch would silently do nothing. Seed it with createIntlStoreMock('${requestedLocale}').`);
            }
            // Real behaviour, otherwise a suite exercising a locale switch sees no effect and passes for the wrong reason.
            if (requestedLocale && requestedLocale !== currentLocale) {
                currentLocale = requestedLocale;
                snapshot = {locale: currentLocale, isCurrentLocaleLoaded: true};
                for (const listener of listeners) {
                    listener();
                }
            }
            return Promise.resolve();
        },
        // Falls back like the real `get`, so an unseeded locale returns a string rather than the dotted path.
        get: <TPath extends TranslationPaths>(key: TPath, requestedLocale?: Locale) =>
            cache.get(requestedLocale && cache.has(requestedLocale) ? requestedLocale : currentLocale)?.[key] ?? null,
        subscribe: (listener: () => void) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        getSnapshot: () => snapshot,
        hasLocale: (requestedLocale: Locale) => cache.has(requestedLocale),
    };
}

/** Adds the seed, which is how a cold-start suite lands the table it deliberately started without. */
type ColdMockedIntlStore = MockedIntlStore & Pick<typeof IntlStore, 'seedForTests'>;

/**
 * Like {@link createIntlStoreMock}, but nothing is loaded until the suite calls `seedForTests`, so it can assert what
 * renders during the load window and again after. `load` is inert, leaving the arrival for the test to schedule.
 */
function createColdIntlStoreMock(locale: Locale = 'en'): ColdMockedIntlStore {
    const cache = new Map<Locale, FlatTranslationsObject>();
    const listeners = new Set<() => void>();
    let snapshot = {locale, isCurrentLocaleLoaded: false};

    return {
        getCurrentLocale: () => locale,
        load: () => Promise.resolve(),
        get: <TPath extends TranslationPaths>(key: TPath, requestedLocale?: Locale) => cache.get(requestedLocale ?? locale)?.[key] ?? null,
        subscribe: (listener: () => void) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        getSnapshot: () => snapshot,
        hasLocale: (requestedLocale: Locale) => cache.has(requestedLocale),
        seedForTests: (seededLocale: Locale, translations: FlatTranslationsObject) => {
            cache.set(seededLocale, translations);
            snapshot = {locale, isCurrentLocaleLoaded: cache.has(locale)};
            for (const listener of listeners) {
                listener();
            }
        },
    };
}

export {createColdIntlStoreMock};
