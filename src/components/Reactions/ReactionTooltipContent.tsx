import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLocalizedEmojiName} from '@libs/EmojiUtils';
import {getDisplayNameOrYou} from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {multiPersonalDetailsSelector} from '@src/selectors/PersonalDetails';
import type {PersonalDetailsList} from '@src/types/onyx';

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

function userNamesStringSelector(accountIDs: number[], currentUserAccountID: number, translate: LocalizedTranslate) {
    return (personalDetails: OnyxEntry<PersonalDetailsList>) =>
        multiPersonalDetailsSelector(accountIDs)(personalDetails)
            ?.map((user) => getDisplayNameOrYou(user.displayName ?? '', user.accountID, currentUserAccountID, translate))
            .filter((name) => name)
            .join(', ') ?? '';
}

function ReactionTooltipContent({accountIDs, emojiCodes, emojiName, currentUserAccountID}: ReactionTooltipContentProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const namesStringSelector = useCallback(
        (personalDetails: OnyxEntry<PersonalDetailsList>) => userNamesStringSelector(accountIDs, currentUserAccountID, translate)(personalDetails),
        [accountIDs, currentUserAccountID, translate],
    );
    const [namesString] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: namesStringSelector,
    });
    const localizedEmojiName = getLocalizedEmojiName(emojiName, preferredLocale);

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
