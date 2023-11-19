import PropTypes from 'prop-types';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as Emojis from '@assets/emojis';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import EmojiPickerMenuItem from './EmojiPickerMenuItem';
import getSkinToneEmojiFromIndex from './getSkinToneEmojiFromIndex';

const propTypes = {
    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,

    /** Function to sync the selected skin tone with parent, onyx and nvp */
    updatePreferredSkinTone: PropTypes.func.isRequired,

    /** Props related to translation */
    ...withLocalizePropTypes,
};

function EmojiSkinToneList(props) {
    const styles = useThemeStyles();
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
                    style={[styles.flexRow, styles.alignSelfCenter, styles.justifyContentStart, styles.alignItemsCenter]}
                    accessibilityLabel={props.translate('emojiPicker.skinTonePickerLabel')}
                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                >
                    <View style={[styles.emojiItem, styles.wAuto, styles.justifyContentCenter]}>
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
