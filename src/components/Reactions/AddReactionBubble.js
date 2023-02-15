import React from 'react';
import _ from 'underscore';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import Tooltip from '../Tooltip';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Text from '../Text';
import getButtonState from '../../libs/getButtonState';
import * as EmojiPickerAction from '../../libs/actions/EmojiPickerAction';
import emojis from '../../../assets/emojis';

const propTypes = {
    sizeScale: PropTypes.number,
    iconSizeScale: PropTypes.number,
    onSelectEmoji: PropTypes.func.isRequired,
};

const defaultProps = {
    sizeScale: 1,
    iconSizeScale: 1,
};

const AddReactionBubble = (props) => {
    const ref = React.createRef();

    const onPress = () => {
        EmojiPickerAction.showEmojiPicker(() => {}, (emojiCode) => {
            const emoji = _.find(emojis, e => e.code === emojiCode);
            if (emoji != null) {
                props.onSelectEmoji(emoji);
            }
        }, ref.current);
    };

    return (
        <Tooltip text="Add Reaction…">
            <Pressable
                ref={ref}
                style={({
                    hovered,
                    pressed,
                }) => [
                    styles.emojiReactionBubble,
                    StyleUtils.getEmojiReactionBubbleStyle(hovered || pressed, false, props.sizeScale),
                ]}
                onPress={onPress}
            >
                {({
                    hovered,
                    pressed,
                }) => (
                    <>
                        {/* This text will make the view have the same size as a regular
                            emoji reaction. We make the text invisible and put the
                            icon on top of it. */}
                        <Text style={[
                            styles.emojiReactionText,
                            styles.opacity0,
                            StyleUtils.getEmojiReactionTextStyle(props.sizeScale),
                        ]}
                        >
                            aw
                        </Text>
                        <View style={styles.pAbsolute}>
                            <Icon
                                src={Expensicons.AddReaction}
                                width={16 * props.iconSizeScale}
                                height={16 * props.iconSizeScale}
                                fill={StyleUtils.getIconFillColor(
                                    getButtonState(hovered, pressed),
                                )}
                            />
                        </View>
                    </>
                )}
            </Pressable>

        </Tooltip>
    );
};

AddReactionBubble.propTypes = propTypes;
AddReactionBubble.defaultProps = defaultProps;
AddReactionBubble.displayName = 'AddReactionBubble';

export default AddReactionBubble;
