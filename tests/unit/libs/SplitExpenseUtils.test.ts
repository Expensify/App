import {computeSplitSaveErrorMessage, computeSplitWarningMessage} from '@libs/SplitExpenseUtils';
import CONST from '@src/CONST';
import type {SplitExpense} from '@src/types/onyx/IOU';

// Minimal translate mock: returns the translation key plus any first argument for verifying
// which message was chosen without relying on exact English strings.
const translate = jest.fn((key: string, ...args: unknown[]) => (args.length ? `${key}:${String(args.at(0))}` : key));

function makeSplit(amount: number, transactionID = `tx-${amount}`): SplitExpense {
    return {transactionID, amount, created: '2024-01-01'};
}

const GREATER = 'iou.totalAmountGreaterThanOriginal';
const LESS = 'iou.totalAmountLessThanOriginal';

beforeEach(() => {
    translate.mockClear();
});

describe('computeSplitWarningMessage', () => {
    const currency = 'USD';

    it('returns "less" warning when there are no splits (sum=0 is below total)', () => {
        // No splits means sum=0 which is less than any positive total
        const result = computeSplitWarningMessage({
            splitExpenses: [],
            transactionDetailsAmount: 1000,
            currency,
            translate: translate as never,
        });
        expect(result).toContain(LESS);
    });

    it('returns empty string when there are no splits and total is also 0', () => {
        expect(
            computeSplitWarningMessage({
                splitExpenses: [],
                transactionDetailsAmount: 0,
                currency,
                translate: translate as never,
            }),
        ).toBe('');
    });

    it('returns empty string when split sum equals the total', () => {
        expect(
            computeSplitWarningMessage({
                splitExpenses: [makeSplit(600), makeSplit(400)],
                transactionDetailsAmount: 1000,
                currency,
                translate: translate as never,
            }),
        ).toBe('');
    });

    it('returns "greater" warning when split sum exceeds positive total (no invalid split)', () => {
        const result = computeSplitWarningMessage({
            splitExpenses: [makeSplit(600), makeSplit(500)],
            transactionDetailsAmount: 1000,
            currency,
            translate: translate as never,
        });
        expect(result).toContain(GREATER);
    });

    it('returns "less" warning when split sum is below positive total (no invalid split)', () => {
        const result = computeSplitWarningMessage({
            splitExpenses: [makeSplit(300), makeSplit(200)],
            transactionDetailsAmount: 1000,
            currency,
            translate: translate as never,
        });
        expect(result).toContain(LESS);
    });

    it('returns "greater" warning when a single split exceeds the total (invalidSplit path)', () => {
        // One split is greater than total → invalidSplit is found, sum > total
        const result = computeSplitWarningMessage({
            splitExpenses: [makeSplit(1500)],
            transactionDetailsAmount: 1000,
            currency,
            translate: translate as never,
        });
        expect(result).toContain(GREATER);
    });

    it('returns "less" warning when invalidSplit exists but combined sum is below total (other split compensates)', () => {
        // Split A = 1500 (invalid: > 1000), Split B = -700 → sum = 800 < 1000
        const result = computeSplitWarningMessage({
            splitExpenses: [makeSplit(1500, 'a'), makeSplit(-700, 'b')],
            transactionDetailsAmount: 1000,
            currency,
            translate: translate as never,
        });
        // sum (800) < total (1000) → Less
        expect(result).toContain(LESS);
    });

    it('returns empty string when invalidSplit exists but sum equals total (edge: exact cancel-out)', () => {
        // Split A = 1500 (invalid), Split B = -500 → sum = 1000 = total
        const result = computeSplitWarningMessage({
            splitExpenses: [makeSplit(1500, 'a'), makeSplit(-500, 'b')],
            transactionDetailsAmount: 1000,
            currency,
            translate: translate as never,
        });
        // invalidSplit && sum !== total is false → falls to else branches, sum === total → no warning
        expect(result).toBe('');
    });

    describe('mixed-sign splits (some negative, positive total)', () => {
        it('returns "less" warning when difference < 0 (mixed sign, sum under total)', () => {
            // total = 1000, splits = [600, -200] → sum = 400, difference = -600 < 0 → Less
            const result = computeSplitWarningMessage({
                splitExpenses: [makeSplit(600, 'a'), makeSplit(-200, 'b')],
                transactionDetailsAmount: 1000,
                currency,
                translate: translate as never,
            });
            expect(result).toContain(LESS);
        });

        it('returns "greater" warning when mixed-sign difference > 0', () => {
            // total = 500, splits = [1200, -100] → sum = 1100, difference = 600 > 0 → Greater
            const result = computeSplitWarningMessage({
                splitExpenses: [makeSplit(1200, 'a'), makeSplit(-100, 'b')],
                transactionDetailsAmount: 500,
                currency,
                translate: translate as never,
            });
            expect(result).toContain(GREATER);
        });

        it('returns empty string when mixed-sign difference is exactly 0', () => {
            // total = 1000, splits = [1200, -200] → sum = 1000, difference = 0
            const result = computeSplitWarningMessage({
                splitExpenses: [makeSplit(1200, 'a'), makeSplit(-200, 'b')],
                transactionDetailsAmount: 1000,
                currency,
                translate: translate as never,
            });
            expect(result).toBe('');
        });
    });

    describe('negative total (refund/credit scenario)', () => {
        it('returns "less" warning when sum is more negative than total', () => {
            // total = -1000, splits = [-600, -600] → sum = -1200 < -1000 → Less
            const result = computeSplitWarningMessage({
                splitExpenses: [makeSplit(-600, 'a'), makeSplit(-600, 'b')],
                transactionDetailsAmount: -1000,
                currency,
                translate: translate as never,
            });
            expect(result).toContain(LESS);
        });

        it('returns "greater" warning when sum is less negative than total', () => {
            // total = -1000, splits = [-300, -200] → sum = -500 > -1000 → Greater
            const result = computeSplitWarningMessage({
                splitExpenses: [makeSplit(-300, 'a'), makeSplit(-200, 'b')],
                transactionDetailsAmount: -1000,
                currency,
                translate: translate as never,
            });
            expect(result).toContain(GREATER);
        });

        it('returns empty string when negative splits sum equals negative total', () => {
            const result = computeSplitWarningMessage({
                splitExpenses: [makeSplit(-400, 'a'), makeSplit(-600, 'b')],
                transactionDetailsAmount: -1000,
                currency,
                translate: translate as never,
            });
            expect(result).toBe('');
        });
    });
});

describe('computeSplitSaveErrorMessage', () => {
    const currency = 'USD';
    const baseParams = {
        transactionDetailsAmount: 1000,
        currency,
        isDistance: false,
        isPerDiem: false,
        isCard: false,
        translate: translate as never,
    };

    it('returns empty string when splits are valid and sum equals total', () => {
        expect(
            computeSplitSaveErrorMessage({
                ...baseParams,
                splitExpenses: [makeSplit(600), makeSplit(400)],
            }),
        ).toBe('');
    });

    it('returns manySplitsProvided error when count exceeds SPLITS_LIMIT', () => {
        const tooManySplits = Array.from({length: CONST.IOU.SPLITS_LIMIT + 1}, (_, i) => makeSplit(10, `tx-${i}`));
        const result = computeSplitSaveErrorMessage({
            ...baseParams,
            splitExpenses: tooManySplits,
        });
        expect(result).toBe('iou.error.manySplitsProvided');
    });

    it('returns empty string when count is exactly at SPLITS_LIMIT', () => {
        const splits = Array.from({length: CONST.IOU.SPLITS_LIMIT}, (_, i) => makeSplit(Math.floor(1000 / CONST.IOU.SPLITS_LIMIT), `tx-${i}`));
        // Amounts won't perfectly sum to 1000 but we only care about the count check here
        const result = computeSplitSaveErrorMessage({
            ...baseParams,
            splitExpenses: splits,
        });
        // Should NOT hit the manySplitsProvided branch
        expect(result).not.toBe('iou.error.manySplitsProvided');
    });

    it('returns splitExpenseZeroAmount error when any split has amount 0', () => {
        const result = computeSplitSaveErrorMessage({
            ...baseParams,
            splitExpenses: [makeSplit(1000, 'a'), makeSplit(0, 'b')],
        });
        expect(result).toBe('iou.splitExpenseZeroAmount');
    });

    describe('invalidSplit errors (one split exceeds total)', () => {
        it('returns "greater" error when invalidSplit exists and sum > total', () => {
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                splitExpenses: [makeSplit(1500)],
            });
            expect(result).toContain(GREATER);
        });

        it('returns "less" error when invalidSplit exists and sum < total (compensated by another split)', () => {
            // Split A = 1500 (invalid), Split B = -700 → sum = 800 < 1000
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                splitExpenses: [makeSplit(1500, 'a'), makeSplit(-700, 'b')],
            });
            expect(result).toContain(LESS);
        });

        it('skips invalidSplit check for distance expenses', () => {
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                isDistance: true,
                splitExpenses: [makeSplit(1500)],
            });
            // Distance expenses bypass all amount checks
            expect(result).toBe('');
        });
    });

    describe('sum exceeds total (no invalidSplit)', () => {
        it('returns "greater" error for positive total when sum > total', () => {
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                splitExpenses: [makeSplit(600), makeSplit(500)],
            });
            expect(result).toContain(GREATER);
        });

        it('returns "less" error for negative total when all splits are negative and sum exceeds total in magnitude', () => {
            // total = -1000, splits = [-800, -800] → sum = -1600, hasMixedSignSplits = false
            // sumExceedsTotal: Math.abs(-1600) > Math.abs(-1000) = true
            // errorKey: !hasMixedSignSplits && total < 0 → 'Less' (sum is more negative = "less")
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                transactionDetailsAmount: -1000,
                splitExpenses: [makeSplit(-800, 'a'), makeSplit(-800, 'b')],
            });
            expect(result).toContain(LESS);
        });

        it('returns "greater" error for negative total when splits are positive (mixed-sign)', () => {
            // total = -1200 (−PLN 12), splits = [600, 1800] → sum = 2400, hasMixedSignSplits = true
            // sumExceedsTotal: 2400 > -1200 = true
            // errorKey: hasMixedSignSplits → 'Greater' (algebraically sum > total)
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                transactionDetailsAmount: -1200,
                splitExpenses: [makeSplit(600, 'a'), makeSplit(1800, 'b')],
            });
            expect(result).toContain(GREATER);
        });

        it('skips sum-exceeds-total check for distance expenses', () => {
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                isDistance: true,
                splitExpenses: [makeSplit(600), makeSplit(500)],
            });
            expect(result).toBe('');
        });
    });

    describe('sum below total for perDiem/card expenses', () => {
        it('returns "less" error for perDiem when sum < total', () => {
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                isPerDiem: true,
                splitExpenses: [makeSplit(300), makeSplit(200)],
            });
            expect(result).toContain(LESS);
        });

        it('returns "less" error for card expense when sum < total', () => {
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                isCard: true,
                splitExpenses: [makeSplit(300), makeSplit(200)],
            });
            expect(result).toContain(LESS);
        });

        it('returns "greater" error for perDiem with negative total when sum is less negative (abs less)', () => {
            // total = -1000, sum = -300 → Math.abs(-300) < Math.abs(-1000) → sumBelowTotal = true
            // errorKey = 'iou.totalAmountGreaterThanOriginal' (because total < 0)
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                transactionDetailsAmount: -1000,
                isPerDiem: true,
                splitExpenses: [makeSplit(-300)],
            });
            expect(result).toContain(GREATER);
        });

        it('returns empty string for regular (non-perDiem, non-card) expense when sum < total', () => {
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                isPerDiem: false,
                isCard: false,
                splitExpenses: [makeSplit(300), makeSplit(200)],
            });
            expect(result).toBe('');
        });

        it('skips sum-below-total check for distance expense even if perDiem', () => {
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                isDistance: true,
                isPerDiem: true,
                splitExpenses: [makeSplit(300), makeSplit(200)],
            });
            expect(result).toBe('');
        });
    });

    describe('mixed-sign splits', () => {
        it('uses difference for sumExceedsTotal when hasMixedSignSplits (difference > 0)', () => {
            // total = 500, splits = [1200, -100] → sum = 1100, diff = 600 > 0 → sumExceedsTotal = true
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                transactionDetailsAmount: 500,
                splitExpenses: [makeSplit(1200, 'a'), makeSplit(-100, 'b')],
            });
            expect(result).toContain(GREATER);
        });

        it('treats difference < 0 as sumBelowTotal for mixed-sign splits on a perDiem expense', () => {
            // total = 1000, splits = [800, -100] → sum = 700, diff = -300 < 0
            // hasMixedSignSplits = true → sumBelowTotal = (700 < 1000) = true
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                isPerDiem: true,
                splitExpenses: [makeSplit(800, 'a'), makeSplit(-100, 'b')],
            });
            expect(result).toContain(LESS);
        });
    });

    describe('error priority ordering', () => {
        it('manySplitsProvided takes priority over zero-amount error', () => {
            const tooManySplits = Array.from({length: CONST.IOU.SPLITS_LIMIT + 1}, (_, i) => makeSplit(i === 0 ? 0 : 10, `tx-${i}`));
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                splitExpenses: tooManySplits,
            });
            expect(result).toBe('iou.error.manySplitsProvided');
        });

        it('invalidSplit error takes priority over sumExceedsTotal when both conditions are met', () => {
            // An invalid split (amount > total) always also exceeds total, so the invalidSplit
            // branch fires first.  Both produce "greater" here but invalidSplit is checked first.
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                splitExpenses: [makeSplit(1500)],
            });
            expect(result).toContain(GREATER);
        });

        it('sumExceedsTotal error takes priority over zero-amount error', () => {
            // sum 1200 > total 1000 AND one split is 0 — sum-exceeds fires first
            const result = computeSplitSaveErrorMessage({
                ...baseParams,
                splitExpenses: [makeSplit(1200, 'a'), makeSplit(0, 'b')],
            });
            expect(result).toContain(GREATER);
            expect(result).not.toBe('iou.splitExpenseZeroAmount');
        });
    });
});
