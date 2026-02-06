import React, {useMemo} from 'react';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import {getProcessedText, splitTextWithEmojis} from '@libs/EmojiUtils';
import type ReportActionItemMessageHeaderSenderProps from './types';

function ReportActionItemMessageHeaderSender({fragmentText, accountID, delegateAccountID, actorIcon, isSingleLine}: ReportActionItemMessageHeaderSenderProps) {
    const styles = useThemeStyles();
    const processedTextArray = useMemo(() => splitTextWithEmojis(fragmentText), [fragmentText]);

    return (
        <UserDetailsTooltip
            accountID={accountID}
            delegateAccountID={delegateAccountID}
            icon={actorIcon}
        >
            <Text
                numberOfLines={isSingleLine ? 1 : undefined}
                style={[styles.chatItemMessageHeaderSender, isSingleLine ? styles.pre : styles.preWrap, styles.dFlex]}
            >
                {processedTextArray.length !== 0 ? getProcessedText(processedTextArray, [styles.emojisWithTextFontSize, styles.emojisWithTextFontFamily]) : fragmentText}
            </Text>
        </UserDetailsTooltip>
    );
}

export default ReportActionItemMessageHeaderSender;
