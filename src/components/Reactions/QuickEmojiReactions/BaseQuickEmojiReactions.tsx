import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import AddReactionBubble from '@components/Reactions/AddReactionBubble';
import EmojiReactionBubble from '@components/Reactions/EmojiReactionBubble';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
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
                            onPress={Session.checkIfActionIsAllowed(() => onEmojiSelected(emoji, emojiReactions))}
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

export default function ComponentWithOnyx(props: Omit<BaseQuickEmojiReactionsProps, keyof BaseQuickEmojiReactionsOnyxProps>) {
    const [preferredSkinTone, preferredSkinToneMetadata] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE);
    const [emojiReactions, emojiReactionsMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${props.reportActionID}`);
    const [preferredLocale, preferredLocaleMetadata] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);

    if (isLoadingOnyxValue(preferredSkinToneMetadata, emojiReactionsMetadata, preferredLocaleMetadata)) {
        return null;
    }

    return (
        <BaseQuickEmojiReactions
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            preferredSkinTone={preferredSkinTone}
            emojiReactions={emojiReactions}
            preferredLocale={preferredLocale}
        />
    );
}
