import type HapticFeedback from './types';

/**
 * Web does not support Haptic feedback
 */
const hapticFeedback: HapticFeedback = {
    press: () => {},
    longPress: () => {},
    success: () => {},
    error: () => {},
};

export default hapticFeedback;
