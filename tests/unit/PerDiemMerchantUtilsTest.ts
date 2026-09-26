import DateUtils from '@libs/DateUtils';
import {getDisplayMerchant, getPerDiemDisplayParts, getPerDiemMerchant} from '@libs/PerDiemMerchantUtils';
import {getMerchantOrDescription} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import createRandomTransaction from '../utils/collections/transaction';

// The range `computePerDiemExpenseMerchant` persists, so the fixtures exercise the same string the backend holds.
const PER_DIEM_RANGE = 'Aug 19, 2025 - Aug 20, 2025';
const PER_DIEM_MERCHANT = `Berlin, ${PER_DIEM_RANGE}`;
const PER_DIEM_DATES = {start: '2025-08-19 00:00:00', end: '2025-08-20 23:59:59'};

function buildTransaction(merchant: string, comment: Transaction['comment']): Transaction {
    return {...createRandomTransaction(1), merchant, modifiedMerchant: '', comment};
}

function buildPerDiemTransaction(dates: {start: string; end: string} = PER_DIEM_DATES, merchant = PER_DIEM_MERCHANT): Transaction {
    return buildTransaction(merchant, {customUnit: {name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL, attributes: {dates}}});
}

describe('PerDiemMerchantUtils', () => {
    describe('getPerDiemMerchant', () => {
        it('writes the range in English', () => {
            // Given the structured dates of a per diem expense in Berlin
            // When the merchant is built for storage
            const merchant = getPerDiemMerchant('Berlin', PER_DIEM_DATES);

            // Then the range is in English, because a stored merchant must read the same for every viewer
            expect(merchant).toBe(PER_DIEM_MERCHANT);
        });

        it('abbreviates every month as the enUS `MMM` earlier clients stored, so old and new rows read alike', () => {
            // Given the first day of every month, since the month abbreviation is the only part that varies by month
            // When a merchant is built for each of them
            const abbreviations = CONST.DATE.ENGLISH_MONTH_NAMES.map((_, month) => {
                const firstOfMonth = `2025-${String(month + 1).padStart(2, '0')}-01`;
                return getPerDiemMerchant('Berlin', {start: firstOfMonth, end: firstOfMonth}).split(' ').at(1);
            });

            // Then each abbreviation matches what date-fns stored before, so rows written before and after this change match
            expect(abbreviations).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
        });

        it('is read back by the parser it is stored for, including a location with commas', () => {
            // Given a location with commas and a range that spans two months
            const location = 'San Francisco, California, USA';
            const dates = {start: '2025-09-30 00:00:00', end: '2025-10-02 23:59:59'};

            // When the merchant is stored and then parsed back for an English reader
            const merchant = getPerDiemMerchant(location, dates);
            const parts = getPerDiemDisplayParts(buildPerDiemTransaction(dates, merchant), merchant, CONST.LOCALES.EN);

            // Then the full location and range come back, because the parser's pattern is exactly the writer's format
            expect(parts).toEqual({destination: location, dates: 'Sep 30, 2025 - Oct 2, 2025'});
        });

        it('keeps only the location when the dates are missing or unparsable, rather than throwing or storing a malformed range', () => {
            // Given dates that are absent, empty or unparsable
            // When a merchant is built from each
            const fromMissingDates = getPerDiemMerchant('Berlin', undefined);
            const fromEmptyDates = getPerDiemMerchant('Berlin', {start: '', end: ''});
            const fromUnparsableDates = getPerDiemMerchant('Berlin', {start: 'not-a-date', end: 'not-a-date'});

            // Then only the location is stored, because a bad date must neither block the submit nor save a broken range
            expect(fromMissingDates).toBe('Berlin');
            expect(fromEmptyDates).toBe('Berlin');
            expect(fromUnparsableDates).toBe('Berlin');
        });
    });

    describe('getDisplayMerchant', () => {
        it('leaves a non per diem merchant exactly as stored', () => {
            // Given an ordinary expense, which carries no per diem dates
            const transaction = buildTransaction('Starbucks', {comment: ''});

            // When its merchant is shown to a Spanish reader
            const merchant = getDisplayMerchant(transaction, 'Starbucks', CONST.LOCALES.ES);

            // Then it is untouched, because only a per diem merchant has a range to rebuild
            expect(merchant).toBe('Starbucks');
        });

        it('renders the stored range unchanged for an English reader', () => {
            // Given a per diem merchant stored in English
            // When an English reader views it
            const merchant = getDisplayMerchant(buildPerDiemTransaction(), PER_DIEM_MERCHANT, CONST.LOCALES.EN);

            // Then it reads exactly as stored, because the English medium date is the stored format
            expect(merchant).toBe(PER_DIEM_MERCHANT);
        });

        it.each([
            [CONST.LOCALES.ES, 'Berlin, 19 ago 2025 - 20 ago 2025'],
            [CONST.LOCALES.DE, 'Berlin, 19.08.2025 - 20.08.2025'],
            [CONST.LOCALES.JA, 'Berlin, 2025/08/19 - 2025/08/20'],
        ])('rebuilds the range from the structured dates for %s', (locale, expected) => {
            // Given a per diem merchant stored in English
            // When a reader of another language views it
            const merchant = getDisplayMerchant(buildPerDiemTransaction(), PER_DIEM_MERCHANT, locale);

            // Then the range follows that language's own date order and separators, not just translated month names
            expect(merchant).toBe(expected);
        });

        it('keeps the stored merchant when the structured dates are missing', () => {
            // Given a per diem expense whose structured dates are missing
            const transaction = buildPerDiemTransaction({start: '', end: ''});

            // When a Spanish reader views it
            const merchant = getDisplayMerchant(transaction, PER_DIEM_MERCHANT, CONST.LOCALES.ES);

            // Then the stored merchant is shown, because there is nothing to rebuild the range from
            expect(merchant).toBe(PER_DIEM_MERCHANT);
        });

        it('keeps the stored merchant when the structured dates are unparsable', () => {
            // Given a per diem expense whose structured dates cannot be parsed
            const transaction = buildPerDiemTransaction({start: 'not-a-date', end: 'not-a-date'});

            // When a Spanish reader views it
            const merchant = getDisplayMerchant(transaction, PER_DIEM_MERCHANT, CONST.LOCALES.ES);

            // Then the stored merchant is shown, because an invalid date cannot anchor the match
            expect(merchant).toBe(PER_DIEM_MERCHANT);
        });

        it('keeps a location that itself contains commas', () => {
            // Given a destination that contains a comma of its own
            const merchant = `Berlin, Germany, ${PER_DIEM_RANGE}`;

            // When a Spanish reader views it
            const displayed = getDisplayMerchant(buildPerDiemTransaction(), merchant, CONST.LOCALES.ES);

            // Then the whole destination survives, because only the trailing range is replaced, not text after a comma
            expect(displayed).toBe('Berlin, Germany, 19 ago 2025 - 20 ago 2025');
        });

        it('keeps a merchant that does not end in the generated range', () => {
            // Given a merchant edited into comma-separated text with no date range
            const merchant = 'Hotel Rio, Room 5, Floor 2, Tower A';

            // When a Spanish reader views it
            const displayed = getDisplayMerchant(buildPerDiemTransaction(), merchant, CONST.LOCALES.ES);

            // Then it is left as stored, because nothing shows the app wrote it
            expect(displayed).toBe(merchant);
        });

        it('keeps a merchant whose range was written for other dates', () => {
            // Given a merchant whose range does not match the expense's own dates
            const merchant = 'Berlin, Aug 1, 2025 - Aug 2, 2025';

            // When a Spanish reader views it
            const displayed = getDisplayMerchant(buildPerDiemTransaction(), merchant, CONST.LOCALES.ES);

            // Then it is left as stored, because replacing it would show dates the merchant never said
            expect(displayed).toBe(merchant);
        });

        it('rebuilds a range an earlier client wrote in its own language', () => {
            // Given a legacy merchant an earlier client stored with Spanish month abbreviations
            // When a Spanish reader views it
            const displayed = getDisplayMerchant(buildPerDiemTransaction(), 'Berlin, ago 19, 2025 - ago 20, 2025', CONST.LOCALES.ES);

            // Then it is still rebuilt, because matching needs only the day and year numbers
            expect(displayed).toBe('Berlin, 19 ago 2025 - 20 ago 2025');
        });

        it('keeps the stored merchant rather than repeating the destination when a date cannot be formatted', () => {
            // Given a date formatter that fails once, as on an engine missing locale data
            const formatSpy = jest.spyOn(DateUtils, 'formatToMediumDate').mockReturnValueOnce('');

            // When the merchant is shown to a Spanish reader
            const merchant = getDisplayMerchant(buildPerDiemTransaction(), PER_DIEM_MERCHANT, CONST.LOCALES.ES);

            // Then the stored merchant appears once, rather than the destination followed by the whole stored merchant
            expect(merchant).toBe(PER_DIEM_MERCHANT);
            formatSpy.mockRestore();
        });

        it('rebuilds a per diem merchant read through the merchant-or-description accessor', () => {
            // Given a per diem expense read through the accessor that report messages use
            const transaction = buildPerDiemTransaction();

            // When its merchant is shown to a Spanish reader
            const merchant = getDisplayMerchant(transaction, getMerchantOrDescription(transaction), CONST.LOCALES.ES);

            // Then the range is rebuilt, because report messages compose these two helpers
            expect(merchant).toBe('Berlin, 19 ago 2025 - 20 ago 2025');
        });

        it('renders a description as stored when the merchant is missing', () => {
            // Given an expense with no merchant, so the accessor falls back to its description
            const transaction = buildTransaction('', {comment: 'Team lunch'});

            // When it is shown through the same composition report messages use
            const displayed = getDisplayMerchant(transaction, getMerchantOrDescription(transaction), CONST.LOCALES.ES);

            // Then the description is shown as written, because it does not end in the expense's own range
            expect(displayed).toBe('Team lunch');
        });
    });

    describe('getPerDiemDisplayParts', () => {
        it('returns both parts together, so a caller can never render one beside the stored merchant', () => {
            // Given a per diem merchant that matches its structured dates
            // When it is split for a Spanish reader
            const parts = getPerDiemDisplayParts(buildPerDiemTransaction(), PER_DIEM_MERCHANT, CONST.LOCALES.ES);

            // Then destination and range come back as a pair, for callers like the e-receipt that show them on separate lines
            expect(parts).toEqual({destination: 'Berlin', dates: '19 ago 2025 - 20 ago 2025'});
        });

        it('returns nothing when the transaction carries no dates to rebuild from', () => {
            // Given a per diem transaction whose structured dates are absent, which is the state the duplicate action guards against
            const transaction = buildPerDiemTransaction({start: '', end: ''});

            // When its merchant is split for a Spanish reader
            const parts = getPerDiemDisplayParts(transaction, PER_DIEM_MERCHANT, CONST.LOCALES.ES);

            // Then nothing comes back, so the e-receipt shows its label alone rather than a destination it cannot prove
            expect(parts).toBeUndefined();
        });

        it('returns nothing when the merchant cannot be rebuilt', () => {
            // Given a merchant that is not a generated per diem merchant
            // When it is split for a Spanish reader
            const parts = getPerDiemDisplayParts(buildPerDiemTransaction(), 'Team offsite', CONST.LOCALES.ES);

            // Then nothing comes back, so each caller falls back to the stored merchant its own way
            expect(parts).toBeUndefined();
        });
    });
});
