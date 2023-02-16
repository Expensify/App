import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import Text from '../Text';
import * as StyleUtils from '../../styles/StyleUtils';
import BaseMiniContextMenuItem from '../BaseMiniContextMenuItem';

const propTypes = {
    onEmojiSelected: PropTypes.func.isRequired,
    onPressOpenPicker: PropTypes.func,
};

const defaultProps = {
    onPressOpenPicker: () => {},
};

const MiniQuickEmojiReactions = props => (
    <View style={{
        flexDirection: 'row',
    }}
    >
        {_.map(CONST.QUICK_REACTIONS, reaction => (
            <BaseMiniContextMenuItem
                key={reaction.name}
                isDelayButtonStateComplete={false}
                tooltipText={`:${reaction.name}:`}
                onPress={() => props.onEmojiSelected(reaction)}
            >
                <Text style={[
                    styles.emojiReactionText,
                    StyleUtils.getEmojiReactionTextStyle(1.3),
                ]}
                >
                    {reaction.code}
                </Text>
            </BaseMiniContextMenuItem>
        ))}
        {/* <AddReactionBubble */}
        {/*    iconSizeScale={1.2} */}
        {/*    sizeScale={EMOJI_BUBBLE_SCALE} */}
        {/*    onSelectEmoji={props.onEmojiSelected} */}
        {/*    onPressOpenPicker={props.onPressOpenPicker} */}
        {/* /> */}
    </View>
);

MiniQuickEmojiReactions.displayName = 'MiniQuickEmojiReactions';
MiniQuickEmojiReactions.propTypes = propTypes;
MiniQuickEmojiReactions.defaultProps = defaultProps;
export default MiniQuickEmojiReactions;
