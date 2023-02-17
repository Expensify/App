import React from 'react';
import PropTypes from 'prop-types';
import BaseQuickEmojiReactions, {baseQuickEmojiReactionsDefaultProps, baseQuickEmojiReactionsPropTypes} from './BaseQuickEmojiReactions';

const propTypes = {
    ...baseQuickEmojiReactionsPropTypes,
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
