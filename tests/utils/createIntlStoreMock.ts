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
 * Typed against the real store, so a field added there (`hasAnyTranslations` was one) fails to compile here rather than
 * reading `undefined` in each hand-rolled copy of this shape.
 */
export default function createIntlStoreMock(locale: Locale = 'en'): MockedIntlStore {
    // `require` is untyped here on purpose: a jest.mock factory is hoisted above imports, so these cannot be `import`s.
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const translations: Record<string, unknown> = require('@src/languages/en').default;
    const flattenObject: (obj: Record<string, unknown>) => FlatTranslationsObject = require('@src/languages/flattenObject').default;
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    const cache = new Map<Locale, FlatTranslationsObject>([[locale, flattenObject(translations)]]);
    // Same reference on every call so `useSyncExternalStore` does not loop the render.
    const snapshot = {locale, hasAnyTranslations: cache.size > 0};

    return {
        getCurrentLocale: () => locale,
        load: () => Promise.resolve(),
        get: <TPath extends TranslationPaths>(key: TPath, requestedLocale?: Locale) => cache.get(requestedLocale ?? locale)?.[key] ?? null,
        subscribe: () => () => {},
        getSnapshot: () => snapshot,
        hasLocale: (requestedLocale: Locale) => cache.has(requestedLocale),
    };
}
