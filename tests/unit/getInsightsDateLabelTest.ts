import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {translate} from '@libs/Localize';

import getInsightsDateLabel from '@pages/Insights/getInsightsDateLabel';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import {enUS} from 'date-fns/locale/en-US';

/** `formatRange` puts thin spaces around the en dash in English ranges */
const THIN_SPACE = '\u2009';

describe('getInsightsDateLabel', () => {
    const translateEnglish: LocalizedTranslate = (key, ...parameters) => translate(CONST.LOCALES.EN, key, ...parameters);

    beforeAll(() => IntlStore.load(CONST.LOCALES.EN));

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 10, 10));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('shows the preset name', () => {
        // Given a saved preset
        const date = {preset: CONST.SEARCH.DATE_PRESETS.LAST_6_MONTHS};

        // When its label is built
        const label = getInsightsDateLabel(date, translateEnglish, enUS);

        // Then it matches the preset's label in the Date filter
        expect(label).toBe('Last 6 months');
    });

    it('leaves the year out of a custom range within the current year', () => {
        // Given a custom range that falls entirely in the current year
        const date = {from: '2026-09-01', to: '2026-10-15'};

        // When its label is built
        const label = getInsightsDateLabel(date, translateEnglish, enUS);

        // Then the year is implied, so only months and days show
        expect(label).toBe(`Sep 1${THIN_SPACE}–${THIN_SPACE}Oct 15`);
    });

    it('shows the year on both dates of a custom range that reaches outside the current year', () => {
        // Given a custom range that starts in the previous year
        const date = {from: '2025-11-15', to: '2026-01-10'};

        // When its label is built
        const label = getInsightsDateLabel(date, translateEnglish, enUS);

        // Then both dates show the year, so neither is ambiguous
        expect(label).toBe(`Nov 15, 2025${THIN_SPACE}–${THIN_SPACE}Jan 10, 2026`);
    });

    it('shows a custom day in the current year as a short date', () => {
        // Given a custom day in the current year
        const date = {on: '2026-10-05'};

        // When its label is built
        const label = getInsightsDateLabel(date, translateEnglish, enUS);

        // Then it shows the month and day only, without the Date filter's "On" prefix
        expect(label).toBe('Oct 5');
    });

    it('shows the year on a custom day outside the current year', () => {
        // Given a custom day in the previous year
        const date = {on: '2025-10-05'};

        // When its label is built
        const label = getInsightsDateLabel(date, translateEnglish, enUS);

        // Then the year shows, so it isn't mistaken for this year's date
        expect(label).toBe('Oct 5, 2025');
    });
});
