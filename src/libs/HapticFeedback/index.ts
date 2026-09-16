import type HapticFeedback from './types';

/**
 * Web does not support Haptic feedback
 */
const hapticFeedback: HapticFeedback = {
    press: () => {},
    longPress: () => {},
    success: () => {},
    error: () => {},
    inputFocus: () => {},
    expenseSuccess: () => {},
    expenseCreateError: () => {},
    loading: () => {},
    expenseSubmitSuccess: () => {},
};

export default hapticFeedback;
