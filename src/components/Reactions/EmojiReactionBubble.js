import React from 'react';
import PropTypes from 'prop-types';

import styles from '../../styles/styles';
import Text from '../Text';
import * as StyleUtils from '../../styles/StyleUtils';
import {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import Tooltip from '../Tooltip';
import ReactionTooltipContent from './ReactionTooltipContent';
import PressableWithSecondaryInteraction from '../PressableWithSecondaryInteraction';
import withWindowDimensions from '../withWindowDimensions';

const propTypes = {
    emojiName: PropTypes.string.isRequired,

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

    /**
     * The account ids of the users who reacted.
     */
    reactionUsers: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),

    /**
     * The default size of the reaction bubble is defined
     * by the styles in styles.js. This scale factor can be used
     * to make the bubble bigger or smaller.
     */
    sizeScale: PropTypes.number,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    count: 0,
    onReactionListOpen: () => {},
    reactionUsers: [],
    sizeScale: 1,

    ...withCurrentUserPersonalDetailsDefaultProps,
};

const EmojiReactionBubble = props => (
    <Tooltip
        renderTooltipContent={() => (
            <ReactionTooltipContent
                emojiName={props.emojiName}
                emojiCodes={props.emojiCodes}
                accountIDs={props.reactionUsers}
            />
        )}
    >
        <PressableWithSecondaryInteraction
            style={({hovered}) => [
                styles.emojiReactionBubble,
                StyleUtils.getEmojiReactionBubbleStyle(hovered, props.hasUserReacted, props.sizeScale),
            ]}
            onPress={props.onPress}
            onLongPress={props.onReactionListOpen}
            onSecondaryInteraction={props.onReactionListOpen}
            ref={props.forwardedRef}
            isLongPressEnabledWithHover={props.isSmallScreenWidth}
        >
            <Text style={[
                styles.emojiReactionText,
                StyleUtils.getEmojiReactionTextStyle(props.sizeScale),
            ]}
            >
                {props.emojiCodes.join('')}
            </Text>
            {props.count > 0 && (
                <Text style={[
                    styles.reactionCounterText,
                    StyleUtils.getEmojiReactionCounterTextStyle(props.hasUserReacted, props.sizeScale),
                ]}
                >
                    {props.count}
                </Text>
            )}
        </PressableWithSecondaryInteraction>
    </Tooltip>
);
EmojiReactionBubble.propTypes = propTypes;
EmojiReactionBubble.defaultProps = defaultProps;
EmojiReactionBubble.displayName = 'EmojiReactionBubble';

export default withWindowDimensions(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <EmojiReactionBubble {...props} forwardRef={ref} />
)));
