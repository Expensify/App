import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import Text from '../Text';
import * as StyleUtils from '../../styles/StyleUtils';
import BaseMiniContextMenuItem from '../BaseMiniContextMenuItem';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import getButtonState from '../../libs/getButtonState';
import * as EmojiPickerAction from '../../libs/actions/EmojiPickerAction';
import emojis from '../../../assets/emojis';

const propTypes = {
    onEmojiSelected: PropTypes.func.isRequired,
    onPressOpenPicker: PropTypes.func,
    onEmojiPickerWillShow: PropTypes.func,
};

const defaultProps = {
    onEmojiPickerWillShow: () => {},
    onPressOpenPicker: () => {},
};

const MiniQuickEmojiReactions = (props) => {
    // TODO: this is duplicated code with the add reaction bubble. Can we consolidate?
    const ref = React.createRef();

    const openEmojiPicker = () => {
        props.onPressOpenPicker();
        EmojiPickerAction.showEmojiPicker(
            () => {},
            (emojiCode) => {
                const emoji = _.find(emojis, e => e.code === emojiCode);
                if (emoji != null) {
                    props.onEmojiSelected(emoji);
                }
            },
            ref.current,
            props.onEmojiPickerWillShow,
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
MiniQuickEmojiReactions.propTypes = propTypes;
MiniQuickEmojiReactions.defaultProps = defaultProps;
export default MiniQuickEmojiReactions;
