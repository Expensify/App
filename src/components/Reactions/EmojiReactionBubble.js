import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import Text from '../Text';
import * as StyleUtils from '../../styles/StyleUtils';
import PressableWithSecondaryInteraction from '../PressableWithSecondaryInteraction';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import {withCurrentUserPersonalDetailsDefaultProps} from '../withCurrentUserPersonalDetails';

const propTypes = {
    /**
     * The emoji codes to display in the bubble.
     */
    emojiCodes: PropTypes.arrayOf(PropTypes.string).isRequired,

    /**
     * Called when the user presses on the reaction bubble.
     */
    onPress: PropTypes.func.isRequired,

    /**
     * Called when the user long presses or right clicks
     * on the reaction bubble.
     */
    onReactionListOpen: PropTypes.func,

    /**
     * The number of reactions to display in the bubble.
     */
    count: PropTypes.number,

    /** Whether it is for context menu so we can modify its style */
    isContextMenu: PropTypes.bool,

    /**
     * Returns true if the current account has reacted to the report action (with the given skin tone).
     */
    hasUserReacted: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    count: 0,
    onReactionListOpen: () => {},
    isContextMenu: false,

    ...withCurrentUserPersonalDetailsDefaultProps,
};

const EmojiReactionBubble = (props) => (
    <PressableWithSecondaryInteraction
        style={({hovered, pressed}) => [styles.emojiReactionBubble, StyleUtils.getEmojiReactionBubbleStyle(hovered || pressed, props.hasUserReacted, props.isContextMenu)]}
        onPress={props.onPress}
        onLongPress={props.onReactionListOpen}
        onSecondaryInteraction={props.onReactionListOpen}
        ref={props.forwardedRef}
        enableLongPressWithHover={props.isSmallScreenWidth}
        // Prevent text input blur when emoji reaction is clicked
        onMouseDown={(e) => e.preventDefault()}
    >
        <Text style={[styles.emojiReactionBubbleText, styles.userSelectNone, StyleUtils.getEmojiReactionBubbleTextStyle(props.isContextMenu)]}>{props.emojiCodes.join('')}</Text>
        {props.count > 0 && <Text style={[styles.reactionCounterText, styles.userSelectNone, StyleUtils.getEmojiReactionCounterTextStyle(props.hasUserReacted)]}>{props.count}</Text>}
    </PressableWithSecondaryInteraction>
);

EmojiReactionBubble.propTypes = propTypes;
EmojiReactionBubble.defaultProps = defaultProps;
EmojiReactionBubble.displayName = 'EmojiReactionBubble';

export default withWindowDimensions(
    React.forwardRef((props, ref) => (
        <EmojiReactionBubble
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    )),
);
