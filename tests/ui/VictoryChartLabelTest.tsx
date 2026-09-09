import {act, render} from '@testing-library/react-native';

import VictoryChartLabel from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/components/VictoryChartLabel';

import CONST from '@src/CONST';
import enTranslations from '@src/languages/en';
import flattenObject from '@src/languages/flattenObject';
import IntlStore from '@src/languages/IntlStore';

import React from 'react';

import type {createColdIntlStoreMock} from '../utils/createIntlStoreMock';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

/** Records what each Skia text node was asked to draw. The global Skia mock omits the pieces this component renders. */
const mockDrawnText: string[] = [];

jest.mock('@shopify/react-native-skia', () => ({
    Skia: {Font: () => null},
    Text: ({text}: {text: string}) => {
        mockDrawnText.push(text);
        return null;
    },
}));

// Fonts are irrelevant to the locale wiring under test, and the real hook throws outside its provider.
jest.mock('@components/Charts/context/ChartFontsContext', () => ({useChartTypefaces: () => ({})}));

jest.mock('@src/languages/IntlStore', () => ({
    __esModule: true,
    default: jest.requireActual<{createColdIntlStoreMock: typeof createColdIntlStoreMock}>('../utils/createIntlStoreMock').createColdIntlStoreMock(),
}));

describe('VictoryChartLabel', () => {
    it('redraws the As of label when the translations land on a cold start in the same locale', async () => {
        render(
            <VictoryChartLabel
                x={0}
                y={0}
                text="As of: Jun 12, 2026 at 8:48 AM"
                timezone="Asia/Tokyo"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockDrawnText.at(-1)).toBe('As of: Jun 12, 2026 common.conjunctionAt 5:48 PM');

        await act(async () => {
            IntlStore.seedForTests(CONST.LOCALES.EN, flattenObject(enTranslations));
        });

        // The locale never moved off `en`, so a subscription to it alone would have skipped this update entirely.
        expect(mockDrawnText.at(-1)).toBe('As of: Jun 12, 2026 at 5:48 PM');
    });
});
