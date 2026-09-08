import {act, render} from '@testing-library/react-native';

import {ChartFontsContext} from '@components/Charts/context/ChartFontsContext';
import type ChartFontsValue from '@components/Charts/types/chartFontsTypes';
import VictoryChartLabel from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartLabel';

import type {Locale} from '@src/CONST/LOCALES';
import type {FlatTranslationsObject, TranslationPaths} from '@src/languages/types';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type ColdIntlStore = {
    landTranslations: (translations: FlatTranslationsObject) => void;
};

/** Records what each Skia text node was asked to draw. The global Skia mock omits the pieces this component renders. */
const mockDrawnText: string[] = [];

jest.mock('@shopify/react-native-skia', () => ({
    Skia: {Font: () => null},
    Text: ({text}: {text: string}) => {
        mockDrawnText.push(text);
        return null;
    },
}));

/**
 * A store that starts with nothing loaded, which the shared EN seed otherwise hides. Built inside the factory because
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

describe('VictoryChartLabel', () => {
    it('redraws the As of label when the translations land on a cold start in the same locale', async () => {
        const chartFonts = {typefaces: {}, fontManager: null} as unknown as ChartFontsValue;

        render(
            <ChartFontsContext.Provider value={chartFonts}>
                <VictoryChartLabel
                    x={0}
                    y={0}
                    text="As of: Jun 12, 2026 at 8:48 AM"
                    timezone="Asia/Tokyo"
                />
            </ChartFontsContext.Provider>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockDrawnText.at(-1)).toBe('As of: Jun 12, 2026 common.conjunctionAt 5:48 PM');

        await act(async () => {
            coldStore.landTranslations({'common.conjunctionAt': 'at'} as unknown as FlatTranslationsObject);
        });

        // The locale never moved off `en`, so a subscription to it alone would have skipped this update entirely.
        expect(mockDrawnText.at(-1)).toBe('As of: Jun 12, 2026 at 5:48 PM');
    });
});
