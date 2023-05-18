import React from 'react';

const reactionListRef = React.createRef();

/**
 * Show the ReactionList popover modal popover.
 *
 * @param {Object} [event] - a press event.
 * @param {Element} reactionListPopoverAnchor - popoverAnchor
 * @param {String} emojiName - the emoji codes to display near the bubble.
 * @param {String} reportActionID
 */
function showReactionList(event, reactionListPopoverAnchor, emojiName, reportActionID) {
    if (!reactionListRef.current) {
        return;
    }

    reactionListRef.current.showReactionList(event, reactionListPopoverAnchor, emojiName, reportActionID);
}

/**
 * Hide the ReactionList popover.
 * @param {Function} [onHideCallback=() => {}] - Callback to be called after popover is completely hidden
 */
function hideReactionList(onHideCallback = () => {}) {
    if (!reactionListRef.current) {
        return;
    }

    reactionListRef.current.hideReactionList(onHideCallback);
}

export {reactionListRef, showReactionList, hideReactionList};
