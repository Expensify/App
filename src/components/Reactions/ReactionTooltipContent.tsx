import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLocalizedEmojiName} from '@libs/EmojiUtils';
import {getDisplayNameOrYou} from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {multiPersonalDetailsSelector} from '@src/selectors/PersonalDetails';
import type {PersonalDetails} from '@src/types/onyx';

type ReactionTooltipContentProps = {
    /**
     * A list of emoji codes to display in the tooltip.
     */
    emojiCodes: string[];

    /**
     * The name of the emoji to display in the tooltip.
     */
    emojiName: string;

    /**
     * A list of account IDs to display in the tooltip.
     */
    accountIDs: number[];

    /**
     * The account ID of the current user.
     */
    currentUserAccountID: number;
};

function ReactionTooltipContent({accountIDs, emojiCodes, emojiName, currentUserAccountID}: ReactionTooltipContentProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const [users] = useOnyx(
        ONYXKEYS.PERSONAL_DETAILS_LIST,
        {
            selector: multiPersonalDetailsSelector(accountIDs),
        },
        [accountIDs],
    );
    const localizedEmojiName = getLocalizedEmojiName(emojiName, preferredLocale);

    const namesString =
        users
            ?.map((user) => getDisplayNameOrYou(user.displayName ?? '', user.accountID, currentUserAccountID, translate))
            .filter((name) => name)
            .join(', ') ?? '';

    return (
        <View style={[styles.alignItemsCenter, styles.ph2]}>
            <View style={styles.flexRow}>
                {emojiCodes.map((emojiCode) => (
                    <Text
                        key={emojiCode}
                        style={styles.reactionEmojiTitle}
                    >
                        {emojiCode}
                    </Text>
                ))}
            </View>

            <Text style={[styles.mt1, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>{namesString}</Text>

            <Text style={[styles.textMicro, styles.fontColorReactionLabel]}>{`${translate('emojiReactions.reactedWith')} :${localizedEmojiName}:`}</Text>
        </View>
    );
}

ReactionTooltipContent.displayName = 'ReactionTooltipContent';

export default React.memo(ReactionTooltipContent);
