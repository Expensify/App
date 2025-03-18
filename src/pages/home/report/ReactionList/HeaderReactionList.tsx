import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';
import type ReactionListProps from './types';

type HeaderReactionListProps = Omit<ReactionListProps, 'onClose'> & {
    /** Returns true if the current account has reacted to the report action */
    hasUserReacted?: boolean;
};

function HeaderReactionList({emojiCodes, emojiCount, emojiName, hasUserReacted = false}: HeaderReactionListProps) {
    const {
        flexRow,
        justifyContentBetween,
        alignItemsCenter,
        emojiReactionListHeader,
        pt4,
        emojiReactionListHeaderBubble,
        miniQuickEmojiReactionText,
        reactionCounterText,
        reactionListHeaderText,
    } = useThemeStyles();
    const {getEmojiReactionBubbleStyle, getEmojiReactionBubbleTextStyle, getEmojiReactionCounterTextStyle} = useStyleUtils();
    const {preferredLocale} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <View style={[flexRow, justifyContentBetween, alignItemsCenter, emojiReactionListHeader, !shouldUseNarrowLayout && pt4]}>
            <View style={flexRow}>
                <View style={[emojiReactionListHeaderBubble, getEmojiReactionBubbleStyle(false, hasUserReacted)]}>
                    <Text style={[miniQuickEmojiReactionText, getEmojiReactionBubbleTextStyle(true)]}>{emojiCodes.join('')}</Text>
                    <Text style={[reactionCounterText, getEmojiReactionCounterTextStyle(hasUserReacted)]}>{emojiCount}</Text>
                </View>
                <Text style={reactionListHeaderText}>{`:${EmojiUtils.getLocalizedEmojiName(emojiName, preferredLocale)}:`}</Text>
            </View>
        </View>
    );
}

HeaderReactionList.displayName = 'HeaderReactionList';

export default HeaderReactionList;
