import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/**
 * How long to wait before auto-scrolling to the next action-badge target after the current one is resolved.
 *
 * Submit/approve/pay badges play a success animation on the resolved preview, so we wait for it to finish before scrolling there,
 * otherwise the list moves mid-animation. The submit button animates on a much longer timeline than pay/approve (a loading state,
 * then a visible submitted state, then a height collapse), so it needs a longer delay than the paid/thumbs-up animation.
 *
 * Returns the delay in milliseconds for animated badges, or `null` for badges that don't animate (e.g. task/fix) so the caller can
 * scroll on the next frame instead of forcing an unnecessary delay.
 */
function getActionBadgeScrollDelay(actionBadge: ValueOf<typeof CONST.REPORT.ACTION_BADGE> | undefined): number | null {
    switch (actionBadge) {
        case CONST.REPORT.ACTION_BADGE.SUBMIT:
            return CONST.ANIMATION_SUBMIT_LOADING_STATE_DURATION + CONST.ANIMATION_SUBMIT_SUBMITTED_STATE_VISIBLE_DURATION + CONST.ANIMATION_SUBMIT_DURATION;
        case CONST.REPORT.ACTION_BADGE.APPROVE:
        case CONST.REPORT.ACTION_BADGE.PAY:
            return CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY + CONST.ANIMATION_THUMBS_UP_DURATION * 2;
        default:
            return null;
    }
}

export default getActionBadgeScrollDelay;
