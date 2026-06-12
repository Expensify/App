import {
    formatAsOfDateTimeForTimezone,
    getLocalizedVictoryChartLabelText,
    parseDateAsUTC,
} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/localizeVictoryChartLabelText';

describe('localizeVictoryChartLabelText', () => {
    it('parses server UTC chart timestamps', () => {
        const utcDate = parseDateAsUTC('Jun 5, 2026 at 06:47 PM');
        expect(utcDate?.toISOString()).toBe('2026-06-05T18:47:00.000Z');
    });

    it('parses server UTC chart timestamps without a leading zero on the hour', () => {
        const utcDate = parseDateAsUTC('Jun 12, 2026 at 8:48 AM');
        expect(utcDate?.toISOString()).toBe('2026-06-12T08:48:00.000Z');
    });

    it('formats the timestamp in the viewer timezone without a timezone label', () => {
        const utcDate = parseDateAsUTC('Jun 5, 2026 at 06:47 PM');
        expect(utcDate).not.toBeNull();

        const formatted = formatAsOfDateTimeForTimezone(utcDate, 'America/Los_Angeles');
        expect(formatted).toBe('Jun 5, 2026 at 11:47 AM');
    });

    it('rewrites As of labels and leaves other labels unchanged', () => {
        const localized = getLocalizedVictoryChartLabelText('As of: Jun 5, 2026 at 06:47 PM', 'America/Los_Angeles');
        expect(localized).toBe('As of: Jun 5, 2026 at 11:47 AM');

        expect(getLocalizedVictoryChartLabelText('Top employees by spend', 'America/Los_Angeles')).toBe('Top employees by spend');
        expect(getLocalizedVictoryChartLabelText('As of: Jun 5, 2026 at 06:47 PM')).toBe('As of: Jun 5, 2026 at 06:47 PM');
    });
});
