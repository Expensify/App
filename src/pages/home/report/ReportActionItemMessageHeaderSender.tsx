import React, {useMemo} from 'react';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type ReportActionItemMessageHeaderSenderProps = {
    /** Text to display */
    fragmentText: string;

    /** Users accountID */
    accountID: number;

    /** Should this fragment be contained in a single line? */
    isSingleLine?: boolean;

    /** The accountID of the copilot who took this action on behalf of the user */
    delegateAccountID?: number;

    /** Actor icon */
    actorIcon?: OnyxCommon.Icon;
};

function ReportActionItemMessageHeaderSender({fragmentText, accountID, delegateAccountID, actorIcon, isSingleLine}: ReportActionItemMessageHeaderSenderProps) {
    const styles = useThemeStyles();

    const processedTextArray = useMemo(() => {
        const emojisRegex = new RegExp(CONST.REGEX.EMOJIS, CONST.REGEX.EMOJIS.flags.concat('g'));
        const doesTextContainEmojis = emojisRegex.test(fragmentText);

        if (!doesTextContainEmojis) {
            return [];
        }

        return EmojiUtils.splitTextWithEmojis(fragmentText);
    }, [fragmentText]);

    return (
        <UserDetailsTooltip
            accountID={accountID}
            delegateAccountID={delegateAccountID}
            icon={actorIcon}
        >
            {processedTextArray.length !== 0 ? (
                <Text
                    numberOfLines={isSingleLine ? 1 : undefined}
                    style={[styles.chatItemMessageHeaderSender, isSingleLine ? styles.pre : styles.preWrap]}
                >
                    {processedTextArray.map(({text, isEmoji}) => (isEmoji ? <Text style={styles.emojisWithinDisplayName}>{text}</Text> : text))}
                </Text>
            ) : (
                <Text
                    numberOfLines={isSingleLine ? 1 : undefined}
                    style={[styles.chatItemMessageHeaderSender, isSingleLine ? styles.pre : styles.preWrap]}
                >
                    {fragmentText}
                </Text>
            )}
        </UserDetailsTooltip>
    );
}

export default ReportActionItemMessageHeaderSender;
