import getAccountSizeTier from '@libs/telemetry/accountSizeTier';

import CONST from '@src/CONST';

type AccountSizeTag = Parameters<typeof getAccountSizeTier>[0];

const {SMALL, MEDIUM, LARGE, XLARGE} = CONST.TELEMETRY.SIZE_TIER;
const TIERS = [SMALL, MEDIUM, LARGE, XLARGE];

// Kept in sync with the border table by hand on purpose, so an accidental edit to a literal fails a test
const BORDERS: Array<[AccountSizeTag, number[]]> = [
    [CONST.TELEMETRY.TAGS.REPORTS_COUNT, [25, 250, 1000]],
    [CONST.TELEMETRY.TAGS.TRANSACTIONS_COUNT, [25, 250, 1000]],
    [CONST.TELEMETRY.TAGS.PERSONAL_DETAILS_COUNT, [100, 1000]],
    [CONST.TELEMETRY.TAGS.POLICIES_COUNT, [1, 2, 10]],
    [CONST.TELEMETRY.TAGS.DB_SIZE, [5_000_000, 20_000_000, 50_000_000]],
];

describe('getAccountSizeTier', () => {
    describe.each(BORDERS)('%s', (tag, borders) => {
        it('puts 0 in the small tier', () => {
            expect(getAccountSizeTier(tag, 0)).toBe(SMALL);
        });

        it.each(borders.map((border, index) => [border, TIERS.at(index)]))('keeps %d in its own tier because borders are inclusive upper bounds', (border, tier) => {
            expect(getAccountSizeTier(tag, border)).toBe(tier);
        });

        it.each(borders.map((border, index) => [border + 1, TIERS.at(index + 1)]))('moves %d into the next tier', (value, tier) => {
            expect(getAccountSizeTier(tag, value)).toBe(tier);
        });
    });

    it('stops at large for a tag with two borders', () => {
        // Personal details has two borders, so even the biggest account stays in large and the tag never emits a tier that has no border behind it
        expect(getAccountSizeTier(CONST.TELEMETRY.TAGS.PERSONAL_DETAILS_COUNT, 48_000)).toBe(LARGE);
    });

    it('sorts alphabetically in size order', () => {
        // Sentry sorts tag values alphabetically in group-by tables and filters, which is what the numeric prefix is for
        expect([XLARGE, SMALL, LARGE, MEDIUM].sort()).toEqual([SMALL, MEDIUM, LARGE, XLARGE]);
    });
});
