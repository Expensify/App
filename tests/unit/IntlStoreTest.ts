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
            expect(IntlStore.getCurrentLocale()).toBe(CONST.LOCALES.DEFAULT);
        });
    });

    describe('subscribe / notify (useSyncExternalStore integration)', () => {
        it('notifies subscribers after a locale change resolves', async () => {
            await IntlStore.load(CONST.LOCALES.EN);
            const listener = jest.fn();
            const unsubscribe = IntlStore.subscribe(listener);

            await IntlStore.load(CONST.LOCALES.ES);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(IntlStore.getCurrentLocale()).toBe(CONST.LOCALES.ES);
            unsubscribe();
        });

        it('does not notify when load() is called for the already-current locale', async () => {
            await IntlStore.load(CONST.LOCALES.EN);
            const listener = jest.fn();
            const unsubscribe = IntlStore.subscribe(listener);

            await IntlStore.load(CONST.LOCALES.EN);

            expect(listener).not.toHaveBeenCalled();
            unsubscribe();
        });

        it('removes the listener after unsubscribe', async () => {
            await IntlStore.load(CONST.LOCALES.EN);
            const listener = jest.fn();
            const unsubscribe = IntlStore.subscribe(listener);
            unsubscribe();

            await IntlStore.load(CONST.LOCALES.FR);

            expect(listener).not.toHaveBeenCalled();
        });

        it('fans out to multiple subscribers in a single locale change', async () => {
            await IntlStore.load(CONST.LOCALES.EN);
            const a = jest.fn();
            const b = jest.fn();
            const unsubscribeA = IntlStore.subscribe(a);
            const unsubscribeB = IntlStore.subscribe(b);

            await IntlStore.load(CONST.LOCALES.JA);

            expect(a).toHaveBeenCalledTimes(1);
            expect(b).toHaveBeenCalledTimes(1);
            unsubscribeA();
            unsubscribeB();
        });

        it('snapshot reflects the new locale at the moment listeners fire', async () => {
            await IntlStore.load(CONST.LOCALES.EN);
            let snapshotAtNotify: string | undefined;
            const unsubscribe = IntlStore.subscribe(() => {
                snapshotAtNotify = IntlStore.getCurrentLocale();
            });

            await IntlStore.load(CONST.LOCALES.DE);

            expect(snapshotAtNotify).toBe(CONST.LOCALES.DE);
            unsubscribe();
        });

        it('discards a stale in-flight load when a newer load supersedes it (race guard)', async () => {
            await IntlStore.load(CONST.LOCALES.EN);
            const esLoad = IntlStore.load(CONST.LOCALES.ES);
            await IntlStore.load(CONST.LOCALES.EN);
            await esLoad;
            await waitForBatchedUpdates();

            expect(IntlStore.getCurrentLocale()).toBe(CONST.LOCALES.EN);
            // Discarded load's `.then` bails before resetting the flag — early-return must reset it, else OnyxDerived stays gated.
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

        it('subscribe and getCurrentLocale are callable as useSyncExternalStore inputs', async () => {
            await IntlStore.load(CONST.LOCALES.EN);

            function mockSyncExternalStore(subscribe: (l: () => void) => () => void, getSnapshot: () => string) {
                const listener = jest.fn();
                const unsubscribe = subscribe(listener);
                return {listener, getSnapshot, unsubscribe};
            }
            const {listener, getSnapshot, unsubscribe} = mockSyncExternalStore(IntlStore.subscribe, IntlStore.getCurrentLocale);

            await IntlStore.load(CONST.LOCALES.PL);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(getSnapshot()).toBe(CONST.LOCALES.PL);
            unsubscribe();
        });
    });
});
