import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import compose from '../../../libs/compose';
import {skinTones} from '../../../../assets/emojis';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import getSkinToneEmojiCode from './EmojiPickerMenu/getSkinToneEmojiCode';
import EmojiPickerMenuItem from './EmojiPickerMenuItem';

const propTypes = {

    /** Visibility flag for skin tone picker */
    isSkinToneListVisible: PropTypes.bool,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.number.isRequired,

    /** Function to sync the selected skin tone with parent, onyx and nvp */
    setPreferredSkinTone: PropTypes.func.isRequired,

    /** Function to set highlighted skin tone */
    setHighlightedSkinTone: PropTypes.func.isRequired,

    /** Size of the emoji item */
    emojiSize: PropTypes.shape({
        fontSize: PropTypes.number,
    }).isRequired,

    toggleSkinToneList: PropTypes.func.isRequired,


    /** Props related to translation */
    ...withLocalizePropTypes,
};

const defaultProps = {
    isSkinToneListVisible: false,
};

const EmojiSkinTonePicker = props => (
    <View style={[styles.flexRow, styles.p1]}>
        {
            !props.isSkinToneListVisible
                && (
                <Pressable
                    onPress={
                      () => props.toggleSkinToneList(!props.isSkinToneListVisible)
                    }
                    style={[
                        styles.pv1,
                        styles.flex1,
                        styles.flexRow,
                        styles.alignSelfCenter,
                        styles.justifyContentStart,
                    ]}
                >
                    <Text style={[styles.emojiText, props.emojiSize]}>
                        {`${getSkinToneEmojiCode(props.preferredSkinTone)}\uFE0F`}
                    </Text>
                    <Text style={[styles.emojiHeaderStyle]}>
                        {props.translate('emojiPicker.skinTonePickerLabel')}
                    </Text>
                </Pressable>
                )
        }
        {
            props.isSkinToneListVisible
                && (
                <View>
                    <View style={[styles.flexRow]}>
                        {
                      skinTones.map(skinToneEmoji => (
                          <EmojiPickerMenuItem
                              onPress={() => props.setPreferredSkinTone(skinToneEmoji.skinTone)}
                              onHover={() => props.setHighlightedSkinTone(skinToneEmoji.skinTone)}
                              key={skinToneEmoji.code}
                              emojiItemStyle={[styles.emojiSkinToneItem, styles.emojiSkinToneItem]}
                              emoji={`${skinToneEmoji.code}\uFE0F`}
                              isHighlighted={skinToneEmoji.skinTone === props.highlightedSkinToneIndex}
                              emojiSize={props.emojiSize}
                          />
                      ))
                    }
                    </View>
                    <Text style={
                      [styles.emojiHeaderStyle, styles.emojiExtraSmall, styles.textAlignCenter, styles.pv0]
                      }
                    >
                        {props.translate('emojiPicker.setPreferredSkinTone')}
                    </Text>
                </View>
                )
        }

    </View>

);

EmojiSkinTonePicker.propTypes = propTypes;
EmojiSkinTonePicker.defaultProps = defaultProps;


export default compose(
    withLocalize,
)(EmojiSkinTonePicker);
