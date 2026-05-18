import React, {useMemo} from 'react';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import {getProcessedText, splitTextWithEmojis} from '@libs/EmojiUtils';
import type ReportActionItemMessageHeaderSenderProps from './types';

function ReportActionItemMessageHeaderSender({fragmentText, accountID, delegateAccountID, actorIcon, isSingleLine, shouldShowTooltip}: ReportActionItemMessageHeaderSenderProps) {
    const styles = useThemeStyles();
    const processedTextArray = useMemo(() => splitTextWithEmojis(fragmentText), [fragmentText]);

    return (
        <UserDetailsTooltip
            accountID={accountID}
            delegateAccountID={delegateAccountID}
            icon={actorIcon}
            shouldRender={shouldShowTooltip}
        >
            <Text
                numberOfLines={isSingleLine ? 1 : undefined}
                style={[styles.chatItemMessageHeaderSender, isSingleLine ? styles.pre : styles.preWrap]}
            >
                {processedTextArray.length !== 0 ? getProcessedText(processedTextArray, styles.emojisWithTextFontSize) : fragmentText}
            </Text>
        </UserDetailsTooltip>
    );
}

export default ReportActionItemMessageHeaderSender;
