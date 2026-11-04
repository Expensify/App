// cspell:ignore Juni junio
import DateUtils from '@libs/DateUtils';

import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

import {de} from 'date-fns/locale/de';
import {es} from 'date-fns/locale/es';
import {ja} from 'date-fns/locale/ja';

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- 'UTC' is a valid IANA zone but is not in the SelectedTimezone union
const UTC = 'UTC' as SelectedTimezone;

// A UTC instant at midday, so the displayed day is the same in every timezone the test can run in.
const SNAPSHOT_STARTED_AT = '2026-06-20 12:00:00';

describe('DateUtils ordinal long date', () => {
    it('keeps the English ordinal date unchanged', () => {
        // Given a violation snapshot date and no locale, which falls back to en-US
        // When it is formatted for display
        // Then English keeps the ordinal day the hand-written pattern produced, so switching to a localized token is
        // invisible to English users
        expect(DateUtils.formatViolationSnapshotStartedAtDate(SNAPSHOT_STARTED_AT, UTC, undefined)).toBe('June 20th, 2026');
    });

    it('orders the date the way each language does', () => {
        // Given languages that do not write a long date in the US order
        // When the same date is formatted in each
        // Then the day comes before the month in German and Spanish, and Japanese leads with the year. A hand-written
        // pattern kept the US order for every language, which produced forms like `Juni 20., 2026`.
        expect(DateUtils.formatViolationSnapshotStartedAtDate(SNAPSHOT_STARTED_AT, UTC, de)).toBe('20. Juni 2026');
        expect(DateUtils.formatViolationSnapshotStartedAtDate(SNAPSHOT_STARTED_AT, UTC, es)).toBe('20 de junio de 2026');
        expect(DateUtils.formatViolationSnapshotStartedAtDate(SNAPSHOT_STARTED_AT, UTC, ja)).toBe('2026年6月20日');
    });
});
