import variables from '@styles/variables';

/** How far a message has to be swiped left before releasing it opens its thread */
const THRESHOLD = variables.swipeToReplyThreshold;

/** How far past the threshold the message can still be dragged; the drag resists more the closer it gets */
const MAX_OVERSHOOT = 32;

/** A leftward drag has to travel this far before it claims the touch, so taps and long-presses still reach the message */
const ACTIVATION_OFFSET = -12;

/**
 * A rightward drag fails right away and leaves the touch to the screen's swipe-back gesture
 * (react-native-screens turns full-screen swipe-back on by default on iOS 26)
 */
const FAIL_OFFSET_RIGHT = 8;

/** Vertical movement before activation hands the touch to the chat's scroll */
const FAIL_OFFSET_VERTICAL = 12;

/** The reply icon slides in from the trailing edge by this much while it fades in */
const INDICATOR_SLIDE_DISTANCE = 16;

const SPRING_BACK_CONFIG = {damping: 22, stiffness: 260, mass: 0.8};
const ARM_TIMING_CONFIG = {duration: 120};

export {THRESHOLD, MAX_OVERSHOOT, ACTIVATION_OFFSET, FAIL_OFFSET_RIGHT, FAIL_OFFSET_VERTICAL, INDICATOR_SLIDE_DISTANCE, SPRING_BACK_CONFIG, ARM_TIMING_CONFIG};
