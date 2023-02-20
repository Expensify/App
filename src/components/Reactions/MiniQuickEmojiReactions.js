import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import Text from '../Text';
import * as StyleUtils from '../../styles/StyleUtils';
import BaseMiniContextMenuItem from '../BaseMiniContextMenuItem';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import getButtonState from '../../libs/getButtonState';
import * as EmojiPickerAction from '../../libs/actions/EmojiPickerAction';
import {
    baseQuickEmojiReactionsDefaultProps,
    baseQuickEmojiReactionsPropTypes,
} from './QuickEmojiReactions/BaseQuickEmojiReactions';

/**
 * Shows the four common quick reactions and a
 * emoji picker icon button. This is used for the mini
 * context menu which we just show on web, when hovering
 * a message.
 * @param {Props} props
 * @returns {JSX.Element}
 */
const MiniQuickEmojiReactions = (props) => {
    const ref = React.createRef();

    const openEmojiPicker = () => {
        props.onPressOpenPicker();
        EmojiPickerAction.showEmojiPicker(
            () => {},
            (emojiCode, emojiObject) => {
                props.onEmojiSelected(emojiObject);
            },
            ref.current,
        );
    };

    return (
        <View style={styles.flexRow}>
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
            <BaseMiniContextMenuItem
                ref={ref}
                onPress={openEmojiPicker}
                tooltipText="Add emoji reaction"
                isDelayButtonStateComplete={false}
            >
                {({hovered, pressed}) => (
                    <Icon
                        small
                        src={Expensicons.Emoji}
                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, false))}
                    />
                )}
            </BaseMiniContextMenuItem>
        </View>
    );
};

MiniQuickEmojiReactions.displayName = 'MiniQuickEmojiReactions';
MiniQuickEmojiReactions.propTypes = baseQuickEmojiReactionsPropTypes;
MiniQuickEmojiReactions.defaultProps = baseQuickEmojiReactionsDefaultProps;
export default MiniQuickEmojiReactions;
