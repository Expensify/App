/**
 * Offset for a keyboard frame: the content moves by the share of the keyboard animation done so far, so it doesn't
 * jump to a reachable target on the first frame. A target past the end still follows the keyboard, as the scroll view
 * stops at its end.
 */
type FollowOffsetParams = {
    startOffset: number;
    startKeyboardHeight: number;
    endKeyboardHeight: number;
    keyboardHeight: number;
    targetOffset: number;
};

function getFollowOffset({startOffset, startKeyboardHeight, endKeyboardHeight, keyboardHeight, targetOffset}: FollowOffsetParams) {
    'worklet';

    // Negative when an open keyboard gets shorter
    const distance = endKeyboardHeight - startKeyboardHeight;
    const share = distance === 0 ? 1 : Math.min(Math.max((keyboardHeight - startKeyboardHeight) / distance, 0), 1);
    return startOffset + (Math.max(targetOffset, 0) - startOffset) * share;
}

export default getFollowOffset;
