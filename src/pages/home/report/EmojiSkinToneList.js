import React, {useState} from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import compose from '../../../libs/compose';
import {skinTones} from '../../../../assets/emojis';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Text from '../../../components/Text';
import getSkinToneEmojiFromIndex from './EmojiPickerMenu/getSkinToneEmojiFromIndex';
import EmojiPickerMenuItem from './EmojiPickerMenuItem';

const propTypes = {

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,

    /** Function to sync the selected skin tone with parent, onyx and nvp */
    setPreferredSkinTone: PropTypes.func.isRequired,

    /** Size of the emoji item */
    emojiSize: PropTypes.shape({
        fontSize: PropTypes.number,
    }).isRequired,

    /** Props related to translation */
    ...withLocalizePropTypes,
};

const defaultProps = {
};

const EmojiSkinToneList = (props) => {
    const selectedEmoji = getSkinToneEmojiFromIndex(props.preferredSkinTone);
    const [highlightedIndex, setHighlightedIndex] = useState(selectedEmoji.skinTone);
    const [isSkinToneListVisible, toggleSkinToneListVisibility] = useState(false);

    const updateSelectedSkinTone = (skinToneEmoji) => {
        toggleSkinToneListVisibility(!isSkinToneListVisible);
        props.setPreferredSkinTone(skinToneEmoji.skinTone);
    };

    return (
        <View style={[styles.flexRow, styles.p1]}>
            {
            !isSkinToneListVisible
                && (
                <Pressable
                    onPress={
                      () => toggleSkinToneListVisibility(!isSkinToneListVisible)
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
                        {`${selectedEmoji.code}\uFE0F`}
                    </Text>
                    <Text style={[styles.emojiHeaderStyle]}>
                        {props.translate('emojiPicker.skinTonePickerLabel')}
                    </Text>
                </Pressable>
                )
        }
            {
            isSkinToneListVisible
                && (
                <View>
                    <View style={[styles.flexRow]}>
                        {
                      skinTones.map(skinToneEmoji => (
                          <EmojiPickerMenuItem
                              onPress={() => updateSelectedSkinTone(skinToneEmoji)}
                              onHover={() => setHighlightedIndex(skinToneEmoji.skinTone)}
                              key={skinToneEmoji.code}
                              emojiItemStyle={[styles.emojiSkinToneItem, styles.emojiSkinToneItem]}
                              emoji={`${skinToneEmoji.code}\uFE0F`}
                              isHighlighted={skinToneEmoji.skinTone === highlightedIndex}
                              emojiSize={props.emojiSize}
                          />
                      ))
                    }
                    </View>
                </View>
                )
        }

        </View>

    );
};

EmojiSkinToneList.propTypes = propTypes;
EmojiSkinToneList.defaultProps = defaultProps;


export default compose(
    withLocalize,
)(EmojiSkinToneList);
