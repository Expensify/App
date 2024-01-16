import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as EmojiUtils from '@libs/EmojiUtils';
import type {ReactionListProps} from './reactionPropTypes';

type HeaderReactionListProps = ReactionListProps & {
    /** Returns true if the current account has reacted to the report action (with the given skin tone). */
    hasUserReacted: boolean;
};

function HeaderReactionList(props: HeaderReactionListProps) {
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
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <View style={[flexRow, justifyContentBetween, alignItemsCenter, emojiReactionListHeader, !isSmallScreenWidth && pt4]}>
            <View style={flexRow}>
                <View style={[emojiReactionListHeaderBubble, getEmojiReactionBubbleStyle(false, props.hasUserReacted)]}>
                    <Text style={[miniQuickEmojiReactionText, getEmojiReactionBubbleTextStyle(true)]}>{props.emojiCodes.join('')}</Text>
                    <Text style={[reactionCounterText, getEmojiReactionCounterTextStyle(props.hasUserReacted)]}>{props.emojiCount}</Text>
                </View>
                <Text style={reactionListHeaderText}>{`:${EmojiUtils.getLocalizedEmojiName(props.emojiName, preferredLocale)}:`}</Text>
            </View>
        </View>
    );
}

HeaderReactionList.displayName = 'HeaderReactionList';

export default HeaderReactionList;
