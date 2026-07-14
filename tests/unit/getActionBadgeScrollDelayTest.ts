import getActionBadgeScrollDelay from '@pages/inbox/report/getActionBadgeScrollDelay';

import CONST from '@src/CONST';

const SUBMIT_DELAY = CONST.ANIMATION_SUBMIT_LOADING_STATE_DURATION + CONST.ANIMATION_SUBMIT_SUBMITTED_STATE_VISIBLE_DURATION + CONST.ANIMATION_SUBMIT_DURATION;
const PAID_DELAY = CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY + CONST.ANIMATION_THUMBS_UP_DURATION * 2;

describe('getActionBadgeScrollDelay', () => {
    it('waits out the full submit animation timeline for a submit badge', () => {
        expect(getActionBadgeScrollDelay(CONST.REPORT.ACTION_BADGE.SUBMIT)).toBe(SUBMIT_DELAY);
    });

    it('uses the paid/thumbs-up delay for an approve badge', () => {
        expect(getActionBadgeScrollDelay(CONST.REPORT.ACTION_BADGE.APPROVE)).toBe(PAID_DELAY);
    });

    it('uses the paid/thumbs-up delay for a pay badge', () => {
        expect(getActionBadgeScrollDelay(CONST.REPORT.ACTION_BADGE.PAY)).toBe(PAID_DELAY);
    });

    it('uses a longer delay for submit than for approve/pay', () => {
        expect(SUBMIT_DELAY).toBeGreaterThan(PAID_DELAY);
    });

    it('returns null for non-animated badges (task/fix)', () => {
        expect(getActionBadgeScrollDelay(CONST.REPORT.ACTION_BADGE.TASK)).toBeNull();
        expect(getActionBadgeScrollDelay(CONST.REPORT.ACTION_BADGE.FIX)).toBeNull();
    });

    it('returns null when there is no badge', () => {
        expect(getActionBadgeScrollDelay(undefined)).toBeNull();
    });
});
