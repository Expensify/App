// cspell:ignore MESZ
import DateUtils from '@libs/DateUtils';

import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

import {de} from 'date-fns/locale/de';
import {ja} from 'date-fns/locale/ja';

const BERLIN: SelectedTimezone = 'Europe/Berlin';
const NEW_YORK: SelectedTimezone = 'America/New_York';
const TOKYO: SelectedTimezone = 'Asia/Tokyo';

// Midsummer, so Berlin and New York are on daylight saving time
const SUMMER_INSTANT = new Date('2026-06-20T12:00:00Z');

describe('DateUtils.getZoneAbbreviation', () => {
    it('keeps the English zone names unchanged', () => {
        // Given a summer time in New York and no locale, which falls back to en-US
        // When its zone is named
        // Then English keeps its abbreviation
        expect(DateUtils.getZoneAbbreviation(SUMMER_INSTANT, NEW_YORK, undefined)).toBe('EDT');
    });

    it('names the zone the way the language does', () => {
        // Given zones that a language has its own abbreviation for
        // When they are named in that language
        // Then the language's own name is used rather than the English one, such as `MESZ` for summer time in
        // Berlin in German and `JST` for Tokyo in Japanese
        expect(DateUtils.getZoneAbbreviation(SUMMER_INSTANT, BERLIN, de)).toBe('MESZ');
        expect(DateUtils.getZoneAbbreviation(SUMMER_INSTANT, TOKYO, ja)).toBe('JST');
    });
});
