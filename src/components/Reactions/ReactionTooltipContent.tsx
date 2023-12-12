import React, {useMemo} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsHOCProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import useThemeStyles from '@styles/useThemeStyles';
import {PersonalDetails} from '@src/types/onyx';

type ReactionTooltipContentProps = WithCurrentUserPersonalDetailsHOCProps & {
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

function ReactionTooltipContent({accountIDs, currentUserPersonalDetails = {}, emojiCodes, emojiName}: ReactionTooltipContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const users: PersonalDetails[] = useMemo(
        // TODO: remove eslint disable when https://github.com/Expensify/App/pull/30169 is merged
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        () => PersonalDetailsUtils.getPersonalDetailsByIDs(accountIDs, currentUserPersonalDetails.accountID, true),
        [currentUserPersonalDetails.accountID, accountIDs],
    );
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
