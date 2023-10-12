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

    const hideReactionList = () => {
        innerReactionListRef.current.hideReactionList();
    };

    /**
     * Whether PopoverReactionList is active for the Report Action.
     *
     * @param {Number|String} actionID
     * @return {Boolean}
     */
    const isActiveReportAction = (actionID) => Boolean(actionID) && reactionListReportActionID === actionID;

    useImperativeHandle(props.innerRef, () => ({showReactionList, hideReactionList, isActiveReportAction}));

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
