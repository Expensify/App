import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import AddReactionBubble from '@components/Reactions/AddReactionBubble';
import EmojiReactionBubble from '@components/Reactions/EmojiReactionBubble';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BaseQuickEmojiReactionsOnyxProps, BaseQuickEmojiReactionsProps} from './types';

function BaseQuickEmojiReactions({
    reportAction,
    onEmojiSelected,
    preferredLocale = CONST.LOCALES.DEFAULT,
    preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE,
    emojiReactions = {},
    onPressOpenPicker = () => {},
    onWillShowPicker = () => {},
    setIsEmojiPickerActive,
}: BaseQuickEmojiReactionsProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.quickReactionsContainer}>
            {CONST.QUICK_REACTIONS.map((emoji: Emoji) => (
                <Tooltip
                    text={`:${EmojiUtils.getLocalizedEmojiName(emoji.name, preferredLocale)}:`}
                    key={emoji.name}
                >
                    <View>
                        <EmojiReactionBubble
                            emojiCodes={[EmojiUtils.getPreferredEmojiCode(emoji, preferredSkinTone)]}
                            isContextMenu
                            onPress={Session.callFnIfActionIsAllowed(() => onEmojiSelected(emoji, emojiReactions))}
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

export default withOnyx<BaseQuickEmojiReactionsProps, BaseQuickEmojiReactionsOnyxProps>({
    preferredSkinTone: {
        key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    },
    emojiReactions: {
        key: ({reportActionID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
    },
    preferredLocale: {
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    },
})(BaseQuickEmojiReactions);
