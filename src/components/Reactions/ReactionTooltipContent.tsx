import React, {useMemo} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';

type ReactionTooltipContentProps = Pick<WithCurrentUserPersonalDetailsProps, 'currentUserPersonalDetails'> & {
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
};

function ReactionTooltipContent({accountIDs, currentUserPersonalDetails, emojiCodes, emojiName}: ReactionTooltipContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const users = useMemo(() => PersonalDetailsUtils.getPersonalDetailsByIDs(accountIDs, currentUserPersonalDetails.accountID, true), [currentUserPersonalDetails.accountID, accountIDs]);

    const namesString = users
        .map((user) => user?.displayName)
        .filter((name) => name)
        .join(', ');

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

            <Text style={[styles.textMicro, styles.fontColorReactionLabel]}>{`${translate('emojiReactions.reactedWith')} :${emojiName}:`}</Text>
        </View>
    );
}

ReactionTooltipContent.displayName = 'ReactionTooltipContent';

export default React.memo(ReactionTooltipContent);
