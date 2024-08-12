import React, {useMemo} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';
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
    const processedTextArray = useMemo(() => EmojiUtils.splitTextWithEmojis(fragmentText), [fragmentText]);

    return (
        <UserDetailsTooltip
            accountID={accountID}
            delegateAccountID={delegateAccountID}
            icon={actorIcon}
        >
            {processedTextArray.length !== 0 ? (
                <Text style={[styles.chatItemMessageHeaderSender, isSingleLine ? styles.pre : styles.preWrap, styles.dFlex]}>
                    {processedTextArray.map(({text, isEmoji}) =>
                        isEmoji ? (
                            <View>
                                <Text style={[{fontSize: 17, fontFamily: 'System', marginBottom: -4}]}>😁</Text>
                            </View>
                        ) : (
                            <Text
                                numberOfLines={isSingleLine ? 1 : undefined}
                                style={styles.chatItemMessageHeaderSender}
                            >
                                {text}
                            </Text>
                        ),
                    )}
                </Text>
            ) : (
                <Text
                    numberOfLines={isSingleLine ? 1 : undefined}
                    style={[styles.chatItemMessageHeaderSender, isSingleLine ? styles.pre : styles.preWrap, styles.dFlex]}
                >
                    {fragmentText}
                </Text>
            )}
        </UserDetailsTooltip>
    );
}

ReportActionItemMessageHeaderSender.displayName = 'ReportActionItemMessageHeaderSender';

export default ReportActionItemMessageHeaderSender;
