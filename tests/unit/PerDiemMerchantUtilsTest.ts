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
            expect(getPerDiemMerchant('Berlin', PER_DIEM_DATES)).toBe(PER_DIEM_MERCHANT);
        });

        it('abbreviates every month as the enUS `MMM` earlier clients stored, so old and new rows read alike', () => {
            const abbreviations = CONST.DATE.ENGLISH_MONTH_NAMES.map((_, month) => {
                const firstOfMonth = `2025-${String(month + 1).padStart(2, '0')}-01`;
                return getPerDiemMerchant('Berlin', {start: firstOfMonth, end: firstOfMonth}).split(' ').at(1);
            });
            expect(abbreviations).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
        });

        it('is read back by the parser it is stored for, including a location with commas', () => {
            const location = 'San Francisco, California, USA';
            const dates = {start: '2025-09-30 00:00:00', end: '2025-10-02 23:59:59'};
            const merchant = getPerDiemMerchant(location, dates);
            expect(getPerDiemDisplayParts(buildPerDiemTransaction(dates, merchant), merchant, CONST.LOCALES.EN)).toEqual({destination: location, dates: 'Sep 30, 2025 - Oct 2, 2025'});
        });

        it('keeps only the location when the dates are missing or unparsable, rather than throwing or storing a malformed range', () => {
            expect(getPerDiemMerchant('Berlin', undefined)).toBe('Berlin');
            expect(getPerDiemMerchant('Berlin', {start: '', end: ''})).toBe('Berlin');
            expect(getPerDiemMerchant('Berlin', {start: 'not-a-date', end: 'not-a-date'})).toBe('Berlin');
        });
    });

    describe('getDisplayMerchant', () => {
        it('leaves a non per diem merchant exactly as stored', () => {
            expect(getDisplayMerchant(buildTransaction('Starbucks', {comment: ''}), 'Starbucks', CONST.LOCALES.ES)).toBe('Starbucks');
        });

        it('renders the stored range unchanged for an English reader', () => {
            expect(getDisplayMerchant(buildPerDiemTransaction(), PER_DIEM_MERCHANT, CONST.LOCALES.EN)).toBe(PER_DIEM_MERCHANT);
        });

        it.each([
            [CONST.LOCALES.ES, 'Berlin, 19 ago 2025 - 20 ago 2025'],
            [CONST.LOCALES.DE, 'Berlin, 19.08.2025 - 20.08.2025'],
            [CONST.LOCALES.JA, 'Berlin, 2025/08/19 - 2025/08/20'],
        ])('rebuilds the range from the structured dates for %s', (locale, expected) => {
            expect(getDisplayMerchant(buildPerDiemTransaction(), PER_DIEM_MERCHANT, locale)).toBe(expected);
        });

        it('keeps the stored merchant when the structured dates are missing', () => {
            expect(getDisplayMerchant(buildPerDiemTransaction({start: '', end: ''}), PER_DIEM_MERCHANT, CONST.LOCALES.ES)).toBe(PER_DIEM_MERCHANT);
        });

        it('keeps the stored merchant when the structured dates are unparsable', () => {
            expect(getDisplayMerchant(buildPerDiemTransaction({start: 'not-a-date', end: 'not-a-date'}), PER_DIEM_MERCHANT, CONST.LOCALES.ES)).toBe(PER_DIEM_MERCHANT);
        });

        it('keeps a location that itself contains commas', () => {
            const merchant = `Berlin, Germany, ${PER_DIEM_RANGE}`;
            expect(getDisplayMerchant(buildPerDiemTransaction(), merchant, CONST.LOCALES.ES)).toBe('Berlin, Germany, 19 ago 2025 - 20 ago 2025');
        });

        it('keeps a merchant that does not end in the generated range', () => {
            const merchant = 'Hotel Rio, Room 5, Floor 2, Tower A';
            expect(getDisplayMerchant(buildPerDiemTransaction(), merchant, CONST.LOCALES.ES)).toBe(merchant);
        });

        it('keeps a merchant whose range was written for other dates', () => {
            const merchant = 'Berlin, Aug 1, 2025 - Aug 2, 2025';
            expect(getDisplayMerchant(buildPerDiemTransaction(), merchant, CONST.LOCALES.ES)).toBe(merchant);
        });

        it('rebuilds a range an earlier client wrote in its own language', () => {
            expect(getDisplayMerchant(buildPerDiemTransaction(), 'Berlin, ago 19, 2025 - ago 20, 2025', CONST.LOCALES.ES)).toBe('Berlin, 19 ago 2025 - 20 ago 2025');
        });

        it('keeps the stored merchant rather than repeating the destination when a date cannot be formatted', () => {
            const formatSpy = jest.spyOn(DateUtils, 'formatToMediumDate').mockReturnValueOnce('');
            expect(getDisplayMerchant(buildPerDiemTransaction(), PER_DIEM_MERCHANT, CONST.LOCALES.ES)).toBe(PER_DIEM_MERCHANT);
            formatSpy.mockRestore();
        });

        it('rebuilds a per diem merchant read through the merchant-or-description accessor', () => {
            const transaction = buildPerDiemTransaction();
            expect(getDisplayMerchant(transaction, getMerchantOrDescription(transaction), CONST.LOCALES.ES)).toBe('Berlin, 19 ago 2025 - 20 ago 2025');
        });

        it('renders a description as stored when the merchant is missing', () => {
            const transaction = buildTransaction('', {comment: 'Team lunch'});
            expect(getDisplayMerchant(transaction, getMerchantOrDescription(transaction), CONST.LOCALES.ES)).toBe('Team lunch');
        });
    });

    describe('getPerDiemDisplayParts', () => {
        it('returns both parts together, so a caller can never render one beside the stored merchant', () => {
            expect(getPerDiemDisplayParts(buildPerDiemTransaction(), PER_DIEM_MERCHANT, CONST.LOCALES.ES)).toEqual({destination: 'Berlin', dates: '19 ago 2025 - 20 ago 2025'});
        });

        it('returns nothing when the merchant cannot be rebuilt', () => {
            expect(getPerDiemDisplayParts(buildPerDiemTransaction(), 'Team offsite', CONST.LOCALES.ES)).toBeUndefined();
        });
    });
});
