import DateUtils from '@libs/DateUtils';
import isProductTrainingElementDismissed, {hasDismissalExpired} from '@libs/TooltipUtils';

import CONST from '@src/CONST';
import type {DismissedProductTraining} from '@src/types/onyx';

import createMock from '../utils/createMock';

const {MARK_ALL_AS_READ} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;
const SEVEN_DAYS = CONST.PRODUCT_TRAINING_TOOLTIP_REAPPEAR_WINDOW.SEVEN_DAYS;
const ONE_DAY = 24 * 60 * 60 * 1000;

// A fixed "now" so the boundary cases below are exact instead of racing the clock between building the
// fixture and asserting on it.
const NOW = new Date('2026-09-08T12:00:00.000Z').valueOf();

/** Builds a dismissedProductTraining entry whose markAllAsRead dismissal is recorded at the given UTC DB time. */
function dismissedAt(timestamp: string): DismissedProductTraining {
    return createMock<DismissedProductTraining>({[MARK_ALL_AS_READ]: {timestamp, dismissedMethod: 'x'}});
}

/** Builds a dismissedProductTraining entry whose markAllAsRead dismissal happened the given number of ms before NOW. */
function dismissedMsAgo(millisecondsAgo: number): DismissedProductTraining {
    return dismissedAt(DateUtils.getDBTime(NOW - millisecondsAgo));
}

describe('TooltipUtils', () => {
    beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(NOW);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('hasDismissalExpired', () => {
        it('returns false when there is no dismissal data at all', () => {
            expect(hasDismissalExpired(MARK_ALL_AS_READ, undefined, SEVEN_DAYS)).toBe(false);
        });

        it('returns false when this element was never dismissed', () => {
            expect(hasDismissalExpired(MARK_ALL_AS_READ, createMock<DismissedProductTraining>({}), SEVEN_DAYS)).toBe(false);
        });

        it('returns false for a legacy dismissal that stored only a marker string', () => {
            // Legacy entries predate DismissedProductTrainingElement and aren't representable in the current type,
            // so this shape has to be asserted in rather than built with createMock.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- legacy entries stored a bare marker string that DismissedProductTraining does not model.
            const legacyDismissal = {[MARK_ALL_AS_READ]: 'dismissed'} as unknown as DismissedProductTraining;

            expect(hasDismissalExpired(MARK_ALL_AS_READ, legacyDismissal, SEVEN_DAYS)).toBe(false);
        });

        it('returns false when the dismissal carries no timestamp', () => {
            expect(hasDismissalExpired(MARK_ALL_AS_READ, createMock<DismissedProductTraining>({[MARK_ALL_AS_READ]: {dismissedMethod: 'x'}}), SEVEN_DAYS)).toBe(false);
        });

        it('returns false when the timestamp cannot be parsed', () => {
            expect(hasDismissalExpired(MARK_ALL_AS_READ, dismissedAt('not a timestamp'), SEVEN_DAYS)).toBe(false);
        });

        it('returns false while the dismissal is still inside the window', () => {
            expect(hasDismissalExpired(MARK_ALL_AS_READ, dismissedMsAgo(3 * ONE_DAY), SEVEN_DAYS)).toBe(false);
        });

        it('returns true once the dismissal is older than the window', () => {
            expect(hasDismissalExpired(MARK_ALL_AS_READ, dismissedMsAgo(8 * ONE_DAY), SEVEN_DAYS)).toBe(true);
        });

        it('keeps suppressing the tooltip at exactly the window and releases it one millisecond later', () => {
            expect(hasDismissalExpired(MARK_ALL_AS_READ, dismissedMsAgo(SEVEN_DAYS), SEVEN_DAYS)).toBe(false);
            expect(hasDismissalExpired(MARK_ALL_AS_READ, dismissedMsAgo(SEVEN_DAYS + 1), SEVEN_DAYS)).toBe(true);
        });

        it('interprets the stored timestamp as UTC', () => {
            // NOW is 2026-09-08 12:00:00.000 UTC, so this dismissal is exactly seven days old and still suppressed.
            expect(hasDismissalExpired(MARK_ALL_AS_READ, dismissedAt('2026-09-01 12:00:00.000'), SEVEN_DAYS)).toBe(false);
            expect(hasDismissalExpired(MARK_ALL_AS_READ, dismissedAt('2026-09-01 11:59:59.999'), SEVEN_DAYS)).toBe(true);
        });
    });

    describe('isProductTrainingElementDismissed', () => {
        it('returns false when there is no dismissal data at all', () => {
            expect(isProductTrainingElementDismissed(MARK_ALL_AS_READ, undefined)).toBe(false);
        });

        it('returns false when this element was never dismissed', () => {
            expect(isProductTrainingElementDismissed(MARK_ALL_AS_READ, createMock<DismissedProductTraining>({}))).toBe(false);
        });

        it('returns true when the element was dismissed with a timestamp', () => {
            expect(isProductTrainingElementDismissed(MARK_ALL_AS_READ, dismissedAt('2026-09-01 12:00:00.000'))).toBe(true);
        });

        it('returns false when the element has an empty timestamp', () => {
            expect(isProductTrainingElementDismissed(MARK_ALL_AS_READ, dismissedAt(''))).toBe(false);
        });

        it('returns true for a legacy dismissal that stored only a marker string', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- legacy entries stored a bare marker string that DismissedProductTraining does not model.
            const legacyDismissal = {[MARK_ALL_AS_READ]: 'dismissed'} as unknown as DismissedProductTraining;

            expect(isProductTrainingElementDismissed(MARK_ALL_AS_READ, legacyDismissal)).toBe(true);
        });
    });
});
