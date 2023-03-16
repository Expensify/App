import React from 'react';

const reactionListRef = React.createRef();

/**
 * Show the ReactionList popover modal popover.
 *
 * @param {Object} [event] - a press event.
 * @param {Element} reactionListPopoverAnchor - popoverAnchor
 * @param {Array} users - array of users id
 * @param {String} emojiName - the emoji codes to display near the bubble.
 * @param {String} emojiCodes - the emoji codes to display in the bubble.
 * @param {Boolean} hasUserReacted - show if user has reacted
 * @param {Number} sizeScale - set the sizeScale of emoji
 */
function showReactionList(
    event,
    reactionListPopoverAnchor,
    users,
    emojiName,
    emojiCodes,
    hasUserReacted,
    sizeScale,
) {
    if (!reactionListRef.current) {
        return;
    }
    reactionListRef.current.showReactionList(
        event,
        reactionListPopoverAnchor,
        users,
        emojiName,
        emojiCodes,
        hasUserReacted,
        sizeScale,
    );
}

/**
 * Hide the ReactionList popover.
 * Hides the popover menu with an optional delay
 * @param {Boolean} shouldDelay - whether the menu should close after a delay
 * @param {Function} [onHideCallback=() => {}] - Callback to be called after popover is completely hidden
 */
function hideReactionList(shouldDelay, onHideCallback = () => {}) {
    if (!reactionListRef.current) {
        return;
    }
    if (!shouldDelay) {
        reactionListRef.current.hideReactionList(onHideCallback);

        return;
    }

    // Save the active instanceID for which hide action was called.
    // If menu is being closed with a delay, check that whether the same instance exists or a new was created.
    // If instance is not same, cancel the hide action
    const instanceID = reactionListRef.current.instanceID;
    setTimeout(() => {
        if (reactionListRef.current.instanceID !== instanceID) {
            return;
        }

        reactionListRef.current.hideReactionList(onHideCallback);
    }, 800);
}

export {
    reactionListRef,
    showReactionList,
    hideReactionList,
};
