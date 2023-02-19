import React from 'react';
import PropTypes from 'prop-types';
import BaseQuickEmojiReactions, {baseQuickEmojiReactionsDefaultProps, baseQuickEmojiReactionsPropTypes} from './BaseQuickEmojiReactions';

const propTypes = {
    ...baseQuickEmojiReactionsPropTypes,

    /**
     * Function that can be called to close the
     * context menu in which this component is
     * rendered.
     */
    closeContextMenu: PropTypes.func.isRequired,
};

const QuickEmojiReactions = (props) => {
    const onPressOpenPicker = (openPicker) => {
        openPicker();
    };

    return (
        <BaseQuickEmojiReactions
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onPressOpenPicker={onPressOpenPicker}
            onWillShowPicker={props.closeContextMenu}
        />
    );
};

QuickEmojiReactions.displayName = 'QuickEmojiReactions';
QuickEmojiReactions.propTypes = propTypes;
QuickEmojiReactions.defaultProps = baseQuickEmojiReactionsDefaultProps;
export default QuickEmojiReactions;
