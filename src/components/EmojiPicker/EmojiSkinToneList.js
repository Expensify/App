import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as Emojis from '@assets/emojis';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePreferredEmojiSkinTone from '@hooks/usePreferredEmojiSkinTone';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import EmojiPickerMenuItem from './EmojiPickerMenuItem';
import getSkinToneEmojiFromIndex from './getSkinToneEmojiFromIndex';

function EmojiSkinToneList() {
    const styles = useThemeStyles();
    const [highlightedIndex, setHighlightedIndex] = useState(null);
    const [isSkinToneListVisible, setIsSkinToneListVisible] = useState(false);
    const {translate} = useLocalize();
    const [preferredSkinTone, setPreferredSkinTone] = usePreferredEmojiSkinTone();

    const toggleIsSkinToneListVisible = useCallback(() => {
        setIsSkinToneListVisible((prev) => !prev);
    }, []);

    /**
     * Set the preferred skin tone in Onyx and close the skin tone picker
     * @param {object} skinToneEmoji
     */
    function updateSelectedSkinTone(skinToneEmoji) {
        setHighlightedIndex(skinToneEmoji.skinTone);
        setPreferredSkinTone(skinToneEmoji.skinTone);
    }

    useEffect(() => {
        if (!isSkinToneListVisible) {
            return;
        }
        toggleIsSkinToneListVisible();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when preferredSkinTone updates
    }, [preferredSkinTone]);

    const currentSkinTone = getSkinToneEmojiFromIndex(preferredSkinTone);
    return (
        <View style={[styles.flexRow, styles.p3, styles.ph4, styles.emojiPickerContainer]}>
            {!isSkinToneListVisible && (
                <PressableWithoutFeedback
                    onPress={toggleIsSkinToneListVisible}
                    style={[styles.flexRow, styles.alignSelfCenter, styles.justifyContentStart, styles.alignItemsCenter]}
                    accessibilityLabel={translate('emojiPicker.skinTonePickerLabel')}
                    role={CONST.ROLE.BUTTON}
                >
                    <View style={[styles.emojiItem, styles.wAuto, styles.justifyContentCenter]}>
                        <Text style={[styles.emojiText, styles.ph2, styles.textNoWrap]}>{currentSkinTone.code}</Text>
                    </View>
                    <Text style={[styles.emojiSkinToneTitle]}>{translate('emojiPicker.skinTonePickerLabel')}</Text>
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

EmojiSkinToneList.displayName = 'EmojiSkinToneList';

export default EmojiSkinToneList;
