import type HapticFeedback from './types';

/**
 * Web does not support Haptic feedback
 */
const hapticFeedback: HapticFeedback = {
    press: () => {},
    longPress: () => {},
    success: () => {},
    error: () => {},
    selection: () => {},
    expenseSuccess: () => {},
    expenseCreateError: () => {},
    loading: () => {},
    expenseSubmitSuccess: () => {},
};

export default hapticFeedback;
