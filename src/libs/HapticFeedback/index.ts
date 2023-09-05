import {HapticFeedbackError, HapticFeedbackLongPress, HapticFeedbackPress, HapticFeedbackSuccess} from './types';

/**
 * Web does not support Haptic feedback
 */
const press: HapticFeedbackPress = () => {};
const longPress: HapticFeedbackLongPress = () => {};
const success: HapticFeedbackSuccess = () => {};
const error: HapticFeedbackError = () => {};

export default {press, longPress, success, error};
