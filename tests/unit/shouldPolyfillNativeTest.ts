import {LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/CONST/LOCALES';
import * as androidGuards from '@src/languages/shouldPolyfill/index.android';
import * as iosGuards from '@src/languages/shouldPolyfill/index.ios';

import FormatjsListFormat from '@formatjs/intl-listformat';
import {shouldPolyfill as listFormatNeedsLocale} from '@formatjs/intl-listformat/should-polyfill';
import {supportedLocales as listFormatLocales} from '@formatjs/intl-listformat/supported-locales.generated';
import {Locale as FormatjsLocale} from '@formatjs/intl-locale';
import {PluralRules as FormatjsPluralRules} from '@formatjs/intl-pluralrules';
import {shouldPolyfill as pluralRulesNeedsLocale} from '@formatjs/intl-pluralrules/should-polyfill';
import {supportedLocales as pluralRulesLocales} from '@formatjs/intl-pluralrules/supported-locales.generated';

const ORIGINAL_INTL = {ListFormat: Intl.ListFormat, PluralRules: Intl.PluralRules, Locale: Intl.Locale};

function getAvailableListLocales(): Set<unknown> {
    const locales: unknown = Reflect.get(FormatjsListFormat, 'availableLocales');
    if (!(locales instanceof Set)) {
        throw new Error('Expected the FormatJS ListFormat locale registry to be a Set');
    }
    return locales;
}

function checkUncheckedLocale(check: (locale: Locale) => unknown, locale: unknown): unknown {
    const result: unknown = Reflect.apply(check, undefined, [locale]);
    return result;
}

describe.each([
    ['iOS', iosGuards],
    ['Android', androidGuards],
] as const)('%s locale data guards', (platform, {shouldPolyfillListFormat, shouldPolyfillPluralRules}) => {
    beforeAll(() => {
        Object.assign(Intl, {ListFormat: FormatjsListFormat, PluralRules: FormatjsPluralRules, Locale: FormatjsLocale});
        jest.isolateModules(() => {
            require('@formatjs/intl-listformat/locale-data/en');
            require('@formatjs/intl-listformat/locale-data/de');
            require('@formatjs/intl-listformat/locale-data/pt');
            require('@formatjs/intl-listformat/locale-data/zh');
            require('@formatjs/intl-pluralrules/locale-data/en');
            require('@formatjs/intl-pluralrules/locale-data/de');
            require('@formatjs/intl-pluralrules/locale-data/pt');
            require('@formatjs/intl-pluralrules/locale-data/zh');
        });
    });

    beforeEach(() => {
        // Native startup registers English before IntlStore asks about any other language.
        const availableListLocales = getAvailableListLocales();
        availableListLocales.clear();
        availableListLocales.add('en');
        FormatjsPluralRules.availableLocales.clear();
        FormatjsPluralRules.availableLocales.add('en');
    });

    afterEach(() => {
        jest.restoreAllMocks();
        Object.assign(Intl, {ListFormat: FormatjsListFormat, PluralRules: FormatjsPluralRules, Locale: FormatjsLocale});
    });

    afterAll(() => {
        Object.assign(Intl, ORIGINAL_INTL);
    });

    it.each(Object.values(LOCALES))('matches the existing cold-start decisions for %s', (locale) => {
        // Given only the English fallback data, every other app language still needs its own data.
        const expectedListFormat = !!listFormatNeedsLocale(locale);
        const expectedPluralRules = !!pluralRulesNeedsLocale(locale);

        // When IntlStore checks whether to import that language's data.
        const needsListFormat = shouldPolyfillListFormat(locale);
        const needsPluralRules = shouldPolyfillPluralRules(locale);

        // Then changing the matching algorithm must not change which imports run.
        expect(needsListFormat).toBe(expectedListFormat);
        expect(needsPluralRules).toBe(expectedPluralRules);
        expect(needsListFormat).toBe(locale !== LOCALES.EN);
        expect(needsPluralRules).toBe(locale !== LOCALES.EN);
    });

    it.each([
        [LOCALES.DE, 'de'],
        [LOCALES.PT_BR, 'pt'],
        [LOCALES.ZH_HANS, 'zh'],
    ] as const)('stops requesting %s after its %s data loads', (locale, dataLocale) => {
        // Given a language whose locale data is absent on the first check.
        expect(shouldPolyfillListFormat(locale)).toBe(true);
        expect(shouldPolyfillPluralRules(locale)).toBe(true);

        // When the matching data becomes available, including parent tags for regional/script tags.
        getAvailableListLocales().add(dataLocale);
        FormatjsPluralRules.availableLocales.add(dataLocale);

        // Then both a warm language switch and switching back to English skip the imports.
        expect(shouldPolyfillListFormat(locale)).toBe(false);
        expect(shouldPolyfillPluralRules(locale)).toBe(false);
        expect(shouldPolyfillListFormat(LOCALES.EN)).toBe(false);
        expect(shouldPolyfillPluralRules(LOCALES.EN)).toBe(false);
        expect(!!listFormatNeedsLocale(locale)).toBe(false);
        expect(!!pluralRulesNeedsLocale(locale)).toBe(false);
    });

    it('still requests data for an unsupported but well-formed language tag', () => {
        // Given a tag outside the app's locale union, as protection against unchecked runtime input.
        const locale = 'zz-ZZ';

        // When no implementation has data for that language.
        const needsListFormat = checkUncheckedLocale(shouldPolyfillListFormat, locale);
        const needsPluralRules = checkUncheckedLocale(shouldPolyfillPluralRules, locale);

        // Then the guards retain FormatJS's truthy fallback decision without using its matched tag.
        expect(needsListFormat).toBe(!!listFormatNeedsLocale(locale));
        expect(needsPluralRules).toBe(!!pluralRulesNeedsLocale(locale));
        expect(needsListFormat).toBe(true);
        expect(needsPluralRules).toBe(true);
    });

    it('preserves invalid-locale errors', () => {
        // Given a malformed tag that should not be silently treated as missing data.
        const locale = 'not_a_locale';

        // When either implementation checks the tag.
        // Then lookup must reject it just as the FormatJS helpers do.
        expect(() => listFormatNeedsLocale(locale)).toThrow(RangeError);
        expect(() => pluralRulesNeedsLocale(locale)).toThrow(RangeError);
        expect(() => checkUncheckedLocale(shouldPolyfillListFormat, locale)).toThrow(RangeError);
        expect(() => checkUncheckedLocale(shouldPolyfillPluralRules, locale)).toThrow(RangeError);
    });

    it.each(['', undefined, null])('preserves the helper behavior for an empty locale (%s)', (emptyLocale) => {
        // Given unchecked input that FormatJS treats as no requested locale rather than a malformed tag.
        const locale = emptyLocale;

        // When the native guard receives the same input.
        const needsListFormat = checkUncheckedLocale(shouldPolyfillListFormat, locale);
        const needsPluralRules = checkUncheckedLocale(shouldPolyfillPluralRules, locale);

        // Then the helper's default/empty-locale semantics are kept instead of introducing a RangeError.
        expect(needsListFormat).toBe(!!checkUncheckedLocale(listFormatNeedsLocale, locale));
        expect(needsPluralRules).toBe(!!checkUncheckedLocale(pluralRulesNeedsLocale, locale));
        expect(needsListFormat).toBe(false);
        expect(needsPluralRules).toBe(false);
    });

    it('retains the missing-constructor fallback', () => {
        // Given an environment whose polyfills have not yet been installed.
        Reflect.deleteProperty(Intl, 'ListFormat');
        Reflect.deleteProperty(Intl, 'PluralRules');

        // When the guards are called with a supported app language.
        const needsListFormat = shouldPolyfillListFormat(LOCALES.DE);
        const needsPluralRules = shouldPolyfillPluralRules(LOCALES.DE);

        // Then they still request the polyfill data rather than throwing on supportedLocalesOf.
        expect(needsListFormat).toBe(true);
        expect(needsPluralRules).toBe(true);
    });

    it('retains the PluralRules fraction-digit bug check', () => {
        // Given an implementation that reports English support but ignores minimumFractionDigits.
        jest.spyOn(FormatjsPluralRules.prototype, 'select').mockReturnValue('one');

        // When English is checked despite already having data.
        const needsPluralRules = shouldPolyfillPluralRules(LOCALES.EN);

        // Then FormatJS's constructor-bug behavior still requests the polyfill.
        expect(needsPluralRules).toBe(true);
        expect(needsPluralRules).toBe(!!pluralRulesNeedsLocale(LOCALES.EN));
    });

    it('avoids the full locale catalogue and all Locale maximization on the healthy path', () => {
        // Given the native Intl.Locale polyfill and a non-English cold start with only English data.
        let localeConstructions = 0;
        Object.assign(Intl, {
            Locale: new Proxy(FormatjsLocale, {
                construct(target, args, newTarget) {
                    localeConstructions++;
                    const instance: unknown = Reflect.construct(target, args, newTarget);
                    if (typeof instance !== 'object' || instance === null) {
                        throw new TypeError('Expected Intl.Locale to construct an object');
                    }
                    return instance;
                },
            }),
        });
        const maximize = jest.spyOn(FormatjsLocale.prototype, 'maximize');
        const expectedCandidateComparisons = listFormatLocales.length + pluralRulesLocales.length;
        expect(!!listFormatNeedsLocale(LOCALES.DE)).toBe(true);
        expect(!!pluralRulesNeedsLocale(LOCALES.DE)).toBe(true);
        expect(localeConstructions).toBeGreaterThanOrEqual(expectedCandidateComparisons * 2);
        expect(maximize.mock.calls.length).toBeGreaterThanOrEqual(expectedCandidateComparisons * 2);
        const baselineOperations = {localeConstructions, maximizeCalls: maximize.mock.calls.length};
        localeConstructions = 0;
        maximize.mockClear();

        // When the data guards only need a yes/no answer, not the closest tag in the full catalogue.
        const needsListFormat = shouldPolyfillListFormat(LOCALES.DE);
        const needsPluralRules = shouldPolyfillPluralRules(LOCALES.DE);

        // Then the same imports are requested without constructing/maximizing candidate locales.
        expect(needsListFormat).toBe(true);
        expect(needsPluralRules).toBe(true);
        expect(localeConstructions).toBe(0);
        expect(maximize).not.toHaveBeenCalled();
        if (process.env.REPORT_LOCALE_OPERATIONS === 'true') {
            process.stdout.write(
                `${JSON.stringify({
                    platform,
                    catalogueCandidates: expectedCandidateComparisons,
                    baseline: baselineOperations,
                    optimized: {localeConstructions, maximizeCalls: maximize.mock.calls.length},
                })}\n`,
            );
        }
    });
});
