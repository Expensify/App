import React from 'react';
import PropTypes from 'prop-types';
import BaseQuickEmojiReactions, {baseQuickEmojiReactionsDefaultProps, baseQuickEmojiReactionsPropTypes} from './BaseQuickEmojiReactions';

const propTypes = {
    ...baseQuickEmojiReactionsPropTypes,
    closeContextMenu: PropTypes.func.isRequired,
};

const QuickEmojiReactions = (props) => {
    const onPressOpenPicker = (openPicker) => {
        // We first need to close the menu as it's a popover.
        // The picker is a popover as well and on mobile there can only
        // be one active popover at a time.
        props.closeContextMenu(() => {
            requestAnimationFrame(openPicker);
        });
    };

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <BaseQuickEmojiReactions {...props} onPressOpenPicker={onPressOpenPicker} />
    );
};

QuickEmojiReactions.displayName = 'QuickEmojiReactions';
QuickEmojiReactions.propTypes = propTypes;
QuickEmojiReactions.defaultProps = baseQuickEmojiReactionsDefaultProps;
export default QuickEmojiReactions;
