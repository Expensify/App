import {act, render} from '@testing-library/react-native';

import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {LocaleContext, LocaleContextProvider} from '@components/LocaleContextProvider';

import type {Locale} from '@src/CONST/LOCALES';
import type {FlatTranslationsObject, TranslationPaths} from '@src/languages/types';

import React, {useContext} from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type ColdIntlStore = {
    landTranslations: (translations: FlatTranslationsObject) => void;
};

/**
 * A store that starts with nothing loaded, which the shared EN seed otherwise hides. `load` is inert so the provider's
 * effect cannot land the table on its own and the test controls when it arrives. Built inside the factory because
 * `jest.mock` is hoisted above every binding in this file.
 */
jest.mock('@src/languages/IntlStore', () => {
    const listeners = new Set<() => void>();
    let table: FlatTranslationsObject | null = null;
    let snapshot = {locale: 'en' as Locale, isCurrentLocaleLoaded: false};

    return {
        __esModule: true,
        default: {
            getCurrentLocale: () => snapshot.locale,
            hasLocale: () => table !== null,
            get: (key: TranslationPaths) => table?.[key] ?? null,
            subscribe: (listener: () => void) => {
                listeners.add(listener);
                return () => {
                    listeners.delete(listener);
                };
            },
            getSnapshot: () => snapshot,
            load: () => Promise.resolve(),
            landTranslations: (translations: FlatTranslationsObject) => {
                table = translations;
                snapshot = {locale: snapshot.locale, isCurrentLocaleLoaded: true};
                for (const listener of listeners) {
                    listener();
                }
            },
        },
    };
});

const coldStore = (jest.requireMock('@src/languages/IntlStore') as {default: ColdIntlStore}).default;

describe('LocaleContextProvider', () => {
    it('rebuilds translate when the translations land on a cold start in the same locale', async () => {
        const seen: LocaleContextProps[] = [];
        function Capture() {
            seen.push(useContext(LocaleContext));
            return null;
        }

        render(
            <LocaleContextProvider>
                <Capture />
            </LocaleContextProvider>,
        );
        // The provider's own Onyx reads settle first, so the pre-load render captured below is the steady state.
        await waitForBatchedUpdatesWithAct();

        const beforeLoad = seen.at(-1);
        expect(beforeLoad?.translate('common.close')).toBe('common.close');

        act(() => {
            coldStore.landTranslations({'common.close': 'Close'} as unknown as FlatTranslationsObject);
        });

        const afterLoad = seen.at(-1);
        // The locale never moved off `en`, so a callback keyed on it alone would still be the pre-load one.
        expect(afterLoad?.translate).not.toBe(beforeLoad?.translate);
        expect(afterLoad?.translate('common.close')).toBe('Close');
    });
});
