import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {translate} from '@libs/Localize';

import getInsightsExportFileName from '@pages/Insights/getInsightsExportFileName';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

describe('getInsightsExportFileName', () => {
    beforeAll(() => IntlStore.load(CONST.LOCALES.EN));
    const dashboardID = CONST.INSIGHTS.DASHBOARD.SPEND;
    const today = new Date(2026, 9, 16);
    const translateEnglish: LocalizedTranslate = (key, ...parameters) => translate(CONST.LOCALES.EN, key, ...parameters);

    it('uses the displayed preset name and today in the filename', () => {
        // Given the Spend dashboard narrowed to This year
        const date = {preset: CONST.SEARCH.DATE_PRESETS.THIS_YEAR};

        // When its export filename is built
        const fileName = getInsightsExportFileName(dashboardID, date, translateEnglish, today);

        // Then the selected date option is kept rather than expanded to dates
        expect(fileName).toBe('Insights - Spend - This year - 2026-10-16.png');
    });

    it('uses ISO dates for a custom range', () => {
        // Given a custom date range
        const date = {from: '2026-08-01', to: '2026-09-30'};

        // When its export filename is built
        const fileName = getInsightsExportFileName(dashboardID, date, translateEnglish, today);

        // Then both endpoints appear in the filename
        expect(fileName).toBe('Insights - Spend - 2026-08-01 to 2026-09-30 - 2026-10-16.png');
    });

    it('uses the selected date for a single-day filter', () => {
        // Given a dashboard narrowed to one day
        const date = {on: '2026-09-30'};

        // When its export filename is built
        const fileName = getInsightsExportFileName(dashboardID, date, translateEnglish, today);

        // Then the date is unambiguous across locales
        expect(fileName).toBe('Insights - Spend - 2026-09-30 - 2026-10-16.png');
    });
});
