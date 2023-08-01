import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import BasePopoverReactionList from './BasePopoverReactionList';

const PopoverReactionList = forwardRef((props, ref) => {
    const innerReactionListRef = useRef();
    const [reactionListReportActionID, setReactionListReportActionID] = useState('');

    /**
     * Show the ReactionList modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {Element} reactionListAnchor - reactionListAnchor
     * @param {String} emojiName - Name of emoji
     * @param {String} reportActionID
     */
    const showReactionList = (event, reactionListAnchor, emojiName, reportActionID) => {
        setReactionListReportActionID(reportActionID);
        innerReactionListRef.current.showReactionList(event, reactionListAnchor, emojiName);
    };

    useImperativeHandle(ref, () => ({showReactionList, setReactionListReportActionID}), []);

    return (
        <BasePopoverReactionList
            ref={innerReactionListRef}
            reportActionID={reactionListReportActionID}
        />
    );
});

PopoverReactionList.displayName = 'PopoverReactionList';

export default PopoverReactionList;
