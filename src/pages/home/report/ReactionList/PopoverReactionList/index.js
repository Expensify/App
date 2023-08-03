import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
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
    const callbackRef = useRef(() => {});
    const [reactionListReportActionID, setReactionListReportActionID] = useState('');

    // Avoid race condition since setState is asynchronous
    useEffect(() => {
        if (!reactionListReportActionID) {
            return;
        }

        callbackRef.current();
    }, [reactionListReportActionID]);

    /**
     * Show the ReactionList modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {Element} reactionListAnchor - reactionListAnchor
     * @param {String} emojiName - Name of emoji
     * @param {String} reportActionID - ID of the report action
     */
    const showReactionList = (event, reactionListAnchor, emojiName, reportActionID) => {
        callbackRef.current = () => innerReactionListRef.current.showReactionList(event, reactionListAnchor, emojiName);
        setReactionListReportActionID(reportActionID);
    };

    useImperativeHandle(props.innerRef, () => ({showReactionList}), []);

    return (
        <BasePopoverReactionList
            ref={innerReactionListRef}
            reportActionID={reactionListReportActionID}
        />
    );
}

PopoverReactionList.propTypes = propTypes;
PopoverReactionList.defaultProps = defaultProps;
PopoverReactionList.displayName = 'PopoverReactionList';

export default forwardRef((props, ref) => (
    <PopoverReactionList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
