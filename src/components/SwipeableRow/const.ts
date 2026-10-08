import variables from '@styles/variables';

const ACTION_WIDTH = variables.swipeableRowActionWidth;

/** Horizontal movement before the swipe takes the touch, so taps and long-presses still reach the row */
const ACTIVATION_OFFSET = 12;

/** Vertical movement before activation hands the touch back to the list's scroll */
const FAIL_OFFSET_VERTICAL = 12;

/** A full swipe needs to go at least this far past the revealed actions... */
const FULL_SWIPE_MIN_OVERSHOOT = 72;

/** ...and across at least this share of the row */
const FULL_SWIPE_ROW_RATIO = 0.55;

/** A flick faster than this (px/s) opens the actions even before half of them are revealed */
const OPEN_VELOCITY = 600;

const SPRING_CONFIG = {damping: 26, stiffness: 300, mass: 0.8};
const ARM_TIMING_CONFIG = {duration: 120};

const SIDE = {
    NONE: 0,
    LEADING: 1,
    TRAILING: -1,
} as const;

export {ACTION_WIDTH, ACTIVATION_OFFSET, FAIL_OFFSET_VERTICAL, FULL_SWIPE_MIN_OVERSHOOT, FULL_SWIPE_ROW_RATIO, OPEN_VELOCITY, SPRING_CONFIG, ARM_TIMING_CONFIG, SIDE};
