import React, {useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import BaseMiniContextMenuItem from '@components/BaseMiniContextMenuItem';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLocalizedEmojiName, getPreferredEmojiCode} from '@libs/EmojiUtils';
import getButtonState from '@libs/getButtonState';
import variables from '@styles/variables';
import {emojiPickerRef, showEmojiPicker} from '@userActions/EmojiPickerAction';
import {callFnIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BaseQuickEmojiReactionsOnyxProps, BaseQuickEmojiReactionsProps} from './QuickEmojiReactions/types';

type MiniQuickEmojiReactionsProps = BaseQuickEmojiReactionsProps & {
    /**
     * Will be called when the user closed the emoji picker
     * without selecting an emoji.
     */
    onEmojiPickerClosed?: () => void;
};

/**
 * Shows the four common quick reactions and a
 * emoji picker icon button. This is used for the mini
 * context menu which we just show on web, when hovering
 * a message.
 */
function MiniQuickEmojiReactions({
    reportAction,
    onEmojiSelected,
    preferredLocale = CONST.LOCALES.DEFAULT,
    preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE,
    emojiReactions = {},
    onPressOpenPicker = () => {},
    onEmojiPickerClosed = () => {},
}: MiniQuickEmojiReactionsProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const ref = useRef<View>(null);
    const {translate} = useLocalize();

    const openEmojiPicker = () => {
        onPressOpenPicker();
        showEmojiPicker(
            onEmojiPickerClosed,
            (emojiCode, emojiObject) => {
                onEmojiSelected(emojiObject, emojiReactions);
            },
            ref,
            undefined,
            () => {},
            reportAction.reportActionID,
        );
    };

    return (
        <View style={styles.flexRow}>
            {CONST.QUICK_REACTIONS.slice(0, 3).map((emoji: Emoji) => (
                <BaseMiniContextMenuItem
                    key={emoji.name}
                    isDelayButtonStateComplete={false}
                    tooltipText={`:${getLocalizedEmojiName(emoji.name, preferredLocale)}:`}
                    onPress={callFnIfActionIsAllowed(() => onEmojiSelected(emoji, emojiReactions))}
                >
                    <Text
                        style={[styles.miniQuickEmojiReactionText, styles.userSelectNone]}
                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                    >
                        {getPreferredEmojiCode(emoji, preferredSkinTone)}
                    </Text>
                </BaseMiniContextMenuItem>
            ))}
            <BaseMiniContextMenuItem
                ref={ref}
                onPress={callFnIfActionIsAllowed(() => {
                    if (!emojiPickerRef.current?.isEmojiPickerVisible) {
                        openEmojiPicker();
                    } else {
                        emojiPickerRef.current?.hideEmojiPicker();
                    }
                })}
                isDelayButtonStateComplete={false}
                tooltipText={translate('emojiReactions.addReactionTooltip')}
            >
                {({hovered, pressed}) => (
                    <Icon
                        width={variables.iconSizeMedium}
                        height={variables.iconSizeMedium}
                        src={Expensicons.AddReaction}
                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, false))}
                    />
                )}
            </BaseMiniContextMenuItem>
        </View>
    );
}

MiniQuickEmojiReactions.displayName = 'MiniQuickEmojiReactions';

export default withOnyx<MiniQuickEmojiReactionsProps, BaseQuickEmojiReactionsOnyxProps>({
    preferredSkinTone: {
        key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    },
    emojiReactions: {
        key: ({reportActionID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
    },
    preferredLocale: {
        key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    },
})(MiniQuickEmojiReactions);
