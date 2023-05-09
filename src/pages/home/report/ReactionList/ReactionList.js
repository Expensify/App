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
 * @param {Number} emojiCount - count of emoji
 * @param {Boolean} hasUserReacted - show if user has reacted
//  * @param {String} reportActionID
//  * @param {String} reportID
//  *
 */
function showReactionList(
    event,
    reactionListPopoverAnchor,
    users,
    emojiName,
    emojiCodes,
    emojiCount,
    hasUserReacted,

    // reportActionID,
    // reportID,
) {
    if (!reactionListRef.current) {
        return;
    }

    console.log('SHOww');
    console.log('users', users);
    console.log('emojiName', emojiName);
    console.log('emojiCodes', emojiCodes);
    console.log('emojiCount', emojiCount);
    console.log('hasUserReacted', hasUserReacted);

    // console.log('reportActionID', reportActionID);
    // console.log('reportID', reportID);

    reactionListRef.current.showReactionList(
        event,
        reactionListPopoverAnchor,
        users,
        emojiName,
        emojiCodes,
        emojiCount,
        hasUserReacted,

        // reportActionID,
        // reportID,
    );
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

export {
    reactionListRef,
    showReactionList,
    hideReactionList,
};
