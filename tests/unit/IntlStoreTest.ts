import {cancelSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('IntlStore', () => {
    beforeAll(() => {
        Onyx.init({
            keys: {
                NVP_PREFERRED_LOCALE: ONYXKEYS.NVP_PREFERRED_LOCALE,
                ARE_TRANSLATIONS_LOADING: ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING,
            },
        });
        return waitForBatchedUpdates();
    });

    afterEach(() => Onyx.clear());

    describe('eager EN seed', () => {
        it('getCurrentLocale() returns LOCALES.DEFAULT before any load() has been awaited', () => {
            // Given the store as every suite receives it: seeded with English translations but with no `load()` yet
            // committed a locale, which is the shape the app is in while the first translation chunk is still settling
            // When a consumer reads the current locale
            const currentLocale = IntlStore.getCurrentLocale();

            // Then the field initializer answers with the default rather than undefined, so no formatter is ever handed
            // a missing locale
            expect(currentLocale).toBe(CONST.LOCALES.DEFAULT);
        });
    });

    describe('subscribe / notify (useSyncExternalStore integration)', () => {
        it('notifies subscribers after a locale change resolves', async () => {
            // Given a subscriber on a store committed to English, registered the way useSyncExternalStore does it
            await IntlStore.load(CONST.LOCALES.EN);
            const listener = jest.fn();
            const unsubscribe = IntlStore.subscribe(listener);

            // When the user switches to Spanish
            await IntlStore.load(CONST.LOCALES.ES);

            // Then the subscriber hears about it exactly once, so components re-render in Spanish a single time
            expect(listener).toHaveBeenCalledTimes(1);
            expect(IntlStore.getCurrentLocale()).toBe(CONST.LOCALES.ES);
            unsubscribe();
        });

        it('does not notify when load() is called for the already-current locale', async () => {
            // Given a subscriber on a store already committed to English
            await IntlStore.load(CONST.LOCALES.EN);
            const listener = jest.fn();
            const unsubscribe = IntlStore.subscribe(listener);

            // When English is requested again, as every preferred-locale sync does
            await IntlStore.load(CONST.LOCALES.EN);

            // Then nothing is notified, so an unchanged locale costs no re-render
            expect(listener).not.toHaveBeenCalled();
            unsubscribe();
        });

        it('removes the listener after unsubscribe', async () => {
            // Given a listener that has already unsubscribed, as when its component unmounts
            await IntlStore.load(CONST.LOCALES.EN);
            const listener = jest.fn();
            const unsubscribe = IntlStore.subscribe(listener);
            unsubscribe();

            // When the locale changes to French
            await IntlStore.load(CONST.LOCALES.FR);

            // Then it is not called, so an unmounted component is never asked to update
            expect(listener).not.toHaveBeenCalled();
        });

        it('fans out to multiple subscribers in a single locale change', async () => {
            // Given two subscribers, as when several mounted components read the locale
            await IntlStore.load(CONST.LOCALES.EN);
            const a = jest.fn();
            const b = jest.fn();
            const unsubscribeA = IntlStore.subscribe(a);
            const unsubscribeB = IntlStore.subscribe(b);

            // When the locale changes to Japanese
            await IntlStore.load(CONST.LOCALES.JA);

            // Then each is notified exactly once, so every consumer moves to the new language together
            expect(a).toHaveBeenCalledTimes(1);
            expect(b).toHaveBeenCalledTimes(1);
            unsubscribeA();
            unsubscribeB();
        });

        it('snapshot reflects the new locale at the moment listeners fire', async () => {
            // Given a subscriber that reads the locale inside its callback, which is what useSyncExternalStore does
            await IntlStore.load(CONST.LOCALES.EN);
            let snapshotAtNotify: string | undefined;
            const unsubscribe = IntlStore.subscribe(() => {
                snapshotAtNotify = IntlStore.getCurrentLocale();
            });

            // When the locale changes to German
            await IntlStore.load(CONST.LOCALES.DE);

            // Then that read already sees German, so no render is scheduled against the old locale
            expect(snapshotAtNotify).toBe(CONST.LOCALES.DE);
            unsubscribe();
        });

        it('concurrent same-locale load() still populates the translations cache and notifies subscribers (half-cached fast-path race guard)', async () => {
            await jest.isolateModulesAsync(async () => {
                // Given a cold store, isolated from the shared English seed so English is neither cached nor committed,
                // and a subscriber mounted before the translations settle. On the seeded singleton the fast path is
                // never the branch under test, and dropping its cache check would leave this green.
                const ColdStore = (await import('@src/languages/IntlStore')).default;
                const listener = jest.fn();
                const unsubscribe = ColdStore.subscribe(listener);

                // When English is requested twice at once, as overlapping callers can on a cold start
                const firstLoad = ColdStore.load(CONST.LOCALES.EN);
                const secondLoad = ColdStore.load(CONST.LOCALES.EN);
                await Promise.all([firstLoad, secondLoad]);
                await waitForBatchedUpdates();

                // Then the translations are cached and the subscriber notified, because the second call must not take the fast path before the first has filled the cache
                expect(ColdStore.getCurrentLocale()).toBe(CONST.LOCALES.EN);
                expect(ColdStore.get('common.close')).toBeTruthy();
                expect(listener).toHaveBeenCalled();
                unsubscribe();
            });
        });

        it('discards a stale in-flight load when a newer load supersedes it (race guard)', async () => {
            // Given a Spanish load still in flight on a store committed to English
            await IntlStore.load(CONST.LOCALES.EN);
            const esLoad = IntlStore.load(CONST.LOCALES.ES);

            // When the user switches back to English before the Spanish chunk lands
            await IntlStore.load(CONST.LOCALES.EN);
            await esLoad;
            await waitForBatchedUpdates();

            // Then English stays current and the loading flag is cleared: the discarded load bails before resetting it, and OnyxDerived would otherwise stay gated
            expect(IntlStore.getCurrentLocale()).toBe(CONST.LOCALES.EN);
            const flag = await new Promise<boolean | undefined>((resolve) => {
                const id = Onyx.connect({
                    key: ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING,
                    callback: (value) => {
                        Onyx.disconnect(id);
                        resolve(value);
                    },
                });
            });
            expect(flag).toBe(false);
        });

        it('ends the translations span of a load that the already-loaded locale supersedes', async () => {
            // Given a Spanish load in flight with its translations span open under the locale root span
            await IntlStore.load(CONST.LOCALES.EN);
            startSpan(CONST.TELEMETRY.SPAN_LOCALE.ROOT, {name: CONST.TELEMETRY.SPAN_LOCALE.ROOT, op: CONST.TELEMETRY.SPAN_LOCALE.ROOT});
            const esLoad = IntlStore.load(CONST.LOCALES.ES);
            expect(getSpan(CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD)).toBeDefined();

            // When the already-loaded English supersedes it
            await IntlStore.load(CONST.LOCALES.EN);
            await esLoad;

            // Then the span is closed, because the discarded load never ends it and an open span would report a load that never finished
            expect(getSpan(CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD)).toBeUndefined();
            cancelSpan(CONST.TELEMETRY.SPAN_LOCALE.ROOT);
        });

        it('keeps the boot gate closed when a superseded load caches a locale nothing renders in', async () => {
            // Given a cold store, isolated from the shared English seed, where a superseded load cached Spanish but nothing committed, so the boot gate must read closed
            await jest.isolateModulesAsync(async () => {
                const ColdStore = (await import('@src/languages/IntlStore')).default;

                const [{default: esTranslations}, {default: flattenObject}] = await Promise.all([import('@src/languages/es'), import('@src/languages/flattenObject')]);
                ColdStore.seedForTests(CONST.LOCALES.ES, flattenObject(esTranslations));

                expect(ColdStore.getCurrentLocale()).toBe(CONST.LOCALES.DEFAULT);
                expect(ColdStore.getSnapshot().isCurrentLocaleLoaded).toBe(false);

                // When French loads and commits
                await ColdStore.load(CONST.LOCALES.FR);
                await waitForBatchedUpdates();

                // Then the gate opens for French, because it asks about the committed locale rather than any cached one
                expect(ColdStore.getCurrentLocale()).toBe(CONST.LOCALES.FR);
                expect(ColdStore.getSnapshot().isCurrentLocaleLoaded).toBe(true);
            });
        });

        it('falls back to English when the active load fails and a superseded one cached a different locale', async () => {
            await jest.isolateModulesAsync(async () => {
                // Given a cold store where only French's chunk fails, so the English fallback still loads through the real loader, and a superseded load cached Spanish
                jest.doMock('@src/utils/retryDynamicImport', () => ({
                    __esModule: true,
                    default: (loader: () => Promise<void>, key: string) => (key.endsWith(CONST.LOCALES.FR) ? Promise.reject(new Error('chunk 404')) : loader()),
                }));

                const ColdStore = (await import('@src/languages/IntlStore')).default;
                const [{default: esTranslations}, {default: flattenObject}] = await Promise.all([import('@src/languages/es'), import('@src/languages/flattenObject')]);
                ColdStore.seedForTests(CONST.LOCALES.ES, flattenObject(esTranslations));

                // When French is requested and its chunk fails
                await ColdStore.load(CONST.LOCALES.FR);
                await waitForBatchedUpdates();

                // Then the store falls back to English and opens the gate, rather than committing the Spanish nobody asked for or leaving the splash up
                expect(ColdStore.getCurrentLocale()).toBe(CONST.LOCALES.DEFAULT);
                expect(ColdStore.getSnapshot().isCurrentLocaleLoaded).toBe(true);
            });
        });

        it('subscribe and getCurrentLocale are callable as useSyncExternalStore inputs', async () => {
            // Given the store's subscribe and getter passed unbound, the way useSyncExternalStore receives them
            await IntlStore.load(CONST.LOCALES.EN);

            function mockSyncExternalStore(subscribe: (l: () => void) => () => void, getSnapshot: () => string) {
                const listener = jest.fn();
                const unsubscribe = subscribe(listener);
                return {listener, getSnapshot, unsubscribe};
            }
            const {listener, getSnapshot, unsubscribe} = mockSyncExternalStore(IntlStore.subscribe, IntlStore.getCurrentLocale);

            // When the locale changes to Polish
            await IntlStore.load(CONST.LOCALES.PL);

            // Then the listener fires once and the getter reads Polish, so neither method depends on being called on the store
            expect(listener).toHaveBeenCalledTimes(1);
            expect(getSnapshot()).toBe(CONST.LOCALES.PL);
            unsubscribe();
        });
    });
});
