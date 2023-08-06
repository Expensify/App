import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import BasePopoverReactionList from './BasePopoverReactionList';

const propTypes = {
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

const defaultProps = {
    innerRef: () => {},
};

function PopoverReactionList(props) {
    const innerReactionListRef = useRef();
    const [reactionListReportActionID, setReactionListReportActionID] = useState('');
    const [reactionListEmojiName, setReactionListEmojiName] = useState('');

    /**
     * Show the ReactionList modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {Element} reactionListAnchor - reactionListAnchor
     * @param {String} emojiName - Name of emoji
     * @param {String} reportActionID - ID of the report action
     */
    const showReactionList = (event, reactionListAnchor, emojiName, reportActionID) => {
        setReactionListReportActionID(reportActionID);
        setReactionListEmojiName(emojiName);
        innerReactionListRef.current.showReactionList(event, reactionListAnchor);
    };

    useImperativeHandle(props.innerRef, () => ({showReactionList}), []);

    return (
        <BasePopoverReactionList
            ref={innerReactionListRef}
            reportActionID={reactionListReportActionID}
            emojiName={reactionListEmojiName}
        />
    );
}

PopoverReactionList.propTypes = propTypes;
PopoverReactionList.defaultProps = defaultProps;
PopoverReactionList.displayName = 'PopoverReactionList';

export default React.memo(
    forwardRef((props, ref) => (
        <PopoverReactionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            innerRef={ref}
        />
    )),
);
