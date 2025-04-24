import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import AddReactionBubble from '@components/Reactions/AddReactionBubble';
import EmojiReactionBubble from '@components/Reactions/EmojiReactionBubble';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLocalizedEmojiName, getPreferredEmojiCode} from '@libs/EmojiUtils';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BaseQuickEmojiReactionsProps} from './types';

function BaseQuickEmojiReactions({
    reportAction,
    reportActionID,
    onEmojiSelected,
    onPressOpenPicker = () => {},
    onWillShowPicker = () => {},
    setIsEmojiPickerActive,
}: BaseQuickEmojiReactionsProps) {
    const styles = useThemeStyles();
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {initialValue: CONST.LOCALES.DEFAULT});
    const [preferredSkinTone] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, {initialValue: CONST.EMOJI_DEFAULT_SKIN_TONE});
    const [emojiReactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`, {initialValue: {}});

    return (
        <View style={styles.quickReactionsContainer}>
            {CONST.QUICK_REACTIONS.map((emoji: Emoji) => (
                <Tooltip
                    text={`:${getLocalizedEmojiName(emoji.name, preferredLocale)}:`}
                    key={emoji.name}
                >
                    <View>
                        <EmojiReactionBubble
                            emojiCodes={[getPreferredEmojiCode(emoji, preferredSkinTone)]}
                            isContextMenu
                            onPress={callFunctionIfActionIsAllowed(() => onEmojiSelected(emoji, emojiReactions))}
                        />
                    </View>
                </Tooltip>
            ))}
            <AddReactionBubble
                isContextMenu
                onPressOpenPicker={onPressOpenPicker}
                onWillShowPicker={onWillShowPicker}
                onSelectEmoji={(emoji) => onEmojiSelected(emoji, emojiReactions)}
                reportAction={reportAction}
                setIsEmojiPickerActive={setIsEmojiPickerActive}
            />
        </View>
    );
}

BaseQuickEmojiReactions.displayName = 'BaseQuickEmojiReactions';

export default BaseQuickEmojiReactions;
