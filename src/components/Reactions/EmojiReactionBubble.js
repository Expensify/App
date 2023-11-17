import PropTypes from 'prop-types';
import React from 'react';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import Text from '@components/Text';
import {withCurrentUserPersonalDetailsDefaultProps} from '@components/withCurrentUserPersonalDetails';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

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

    /** We disable reacting with emojis on report actions that have errors */
    shouldBlockReactions: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    count: 0,
    onReactionListOpen: () => {},
    isContextMenu: false,
    shouldBlockReactions: false,

    ...withCurrentUserPersonalDetailsDefaultProps,
};

function EmojiReactionBubble(props) {
    const styles = useThemeStyles();
    return (
        <PressableWithSecondaryInteraction
            style={({hovered, pressed}) => [
                styles.emojiReactionBubble,
                StyleUtils.getEmojiReactionBubbleStyle(hovered || pressed, props.hasUserReacted, props.isContextMenu),
                props.shouldBlockReactions && styles.cursorDisabled,
                styles.userSelectNone,
            ]}
            onPress={() => {
                if (props.shouldBlockReactions) {
                    return;
                }

                props.onPress();
            }}
            onLongPress={props.onReactionListOpen}
            onSecondaryInteraction={props.onReactionListOpen}
            ref={props.forwardedRef}
            enableLongPressWithHover={props.isSmallScreenWidth}
            onMouseDown={(e) => {
                // Allow text input blur when emoji reaction is right clicked
                if (e && e.button === 2) {
                    return;
                }

                // Prevent text input blur when emoji reaction is left clicked
                e.preventDefault();
            }}
            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
            accessibilityLabel={props.emojiCodes.join('')}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
        >
            <Text style={[styles.emojiReactionBubbleText, StyleUtils.getEmojiReactionBubbleTextStyle(props.isContextMenu)]}>{props.emojiCodes.join('')}</Text>
            {props.count > 0 && <Text style={[styles.reactionCounterText, StyleUtils.getEmojiReactionCounterTextStyle(props.hasUserReacted)]}>{props.count}</Text>}
        </PressableWithSecondaryInteraction>
    );
}

EmojiReactionBubble.propTypes = propTypes;
EmojiReactionBubble.defaultProps = defaultProps;
EmojiReactionBubble.displayName = 'EmojiReactionBubble';

const EmojiReactionBubbleWithRef = React.forwardRef((props, ref) => (
    <EmojiReactionBubble
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

EmojiReactionBubbleWithRef.displayName = 'EmojiReactionBubbleWithRef';

export default withWindowDimensions(EmojiReactionBubbleWithRef);
