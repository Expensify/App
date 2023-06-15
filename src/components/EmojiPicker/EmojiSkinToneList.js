import _ from 'underscore';
import React, {useState, useCallback} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import * as Emojis from '../../../assets/emojis';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Text from '../Text';
import EmojiPickerMenuItem from './EmojiPickerMenuItem';
import getSkinToneEmojiFromIndex from './getSkinToneEmojiFromIndex';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';

const propTypes = {
    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,

    /** Function to sync the selected skin tone with parent, onyx and nvp */
    updatePreferredSkinTone: PropTypes.func.isRequired,

    /** Props related to translation */
    ...withLocalizePropTypes,
};

function EmojiSkinToneList(props) {
    const [highlightedIndex, setHighlightedIndex] = useState(null);
    const [isSkinToneListVisible, setIsSkinToneListVisible] = useState(false);

    const toggleIsSkinToneListVisible = useCallback(() => {
        setIsSkinToneListVisible((prev) => !prev);
    }, []);

    /**
     * Pass the skinTone to props and hide the picker
     * @param {object} skinToneEmoji
     */
    function updateSelectedSkinTone(skinToneEmoji) {
        toggleIsSkinToneListVisible();
        setHighlightedIndex(skinToneEmoji.skinTone);
        props.updatePreferredSkinTone(skinToneEmoji.skinTone);
    }

    const currentSkinTone = getSkinToneEmojiFromIndex(props.preferredSkinTone);
    return (
        <View style={[styles.flexRow, styles.p3, styles.ph4, styles.emojiPickerContainer]}>
            {!isSkinToneListVisible && (
                <PressableWithoutFeedback
                    onPress={toggleIsSkinToneListVisible}
                    style={[styles.flex1, styles.flexRow, styles.alignSelfCenter, styles.justifyContentStart, styles.alignItemsCenter]}
                    accessibilityLabel={props.translate('emojiPicker.skinTonePickerLabel')}
                    accessibilityRole="button"
                >
                    <View style={[styles.emojiItem, styles.justifyContentCenter]}>
                        <Text style={[styles.emojiText, styles.ph2, styles.textNoWrap]}>{currentSkinTone.code}</Text>
                    </View>
                    <Text style={[styles.emojiSkinToneTitle]}>{props.translate('emojiPicker.skinTonePickerLabel')}</Text>
                </PressableWithoutFeedback>
            )}
            {isSkinToneListVisible && (
                <View style={[styles.flexRow, styles.flex1]}>
                    {_.map(Emojis.skinTones, (skinToneEmoji) => (
                        <EmojiPickerMenuItem
                            onPress={() => updateSelectedSkinTone(skinToneEmoji)}
                            onHoverIn={() => setHighlightedIndex(skinToneEmoji.skinTone)}
                            onHoverOut={() => setHighlightedIndex(null)}
                            key={skinToneEmoji.code}
                            emoji={skinToneEmoji.code}
                            isHighlighted={skinToneEmoji.skinTone === highlightedIndex || skinToneEmoji.skinTone === currentSkinTone.skinTone}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

EmojiSkinToneList.propTypes = propTypes;
EmojiSkinToneList.displayName = 'EmojiSkinToneList';

export default withLocalize(EmojiSkinToneList);
