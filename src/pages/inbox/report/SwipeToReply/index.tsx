import type SwipeToReplyProps from './types';

/** Swipe-to-reply is a touch gesture; wide layouts keep the hover mini context menu instead. */
function SwipeToReply({children}: SwipeToReplyProps) {
    return children;
}

export default SwipeToReply;
