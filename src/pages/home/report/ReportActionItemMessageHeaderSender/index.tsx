import React, {useMemo} from 'react';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';
import type ReportActionItemMessageHeaderSenderProps from './types';

function ReportActionItemMessageHeaderSender({fragmentText, accountID, delegateAccountID, actorIcon, isSingleLine}: ReportActionItemMessageHeaderSenderProps) {
    const styles = useThemeStyles();
    const processedTextArray = useMemo(() => EmojiUtils.splitTextWithEmojis(fragmentText), [fragmentText]);

    return (
        <UserDetailsTooltip
            accountID={accountID}
            delegateAccountID={delegateAccountID}
            icon={actorIcon}
        >
            <Text
                numberOfLines={isSingleLine ? 1 : undefined}
                style={[styles.chatItemMessageHeaderSender, isSingleLine ? styles.pre : styles.preWrap]}
            >
                {processedTextArray.length !== 0
                    ? processedTextArray.map(({text, isEmoji}, index) =>
                          isEmoji ? (
                              <Text
                                  // eslint-disable-next-line react/no-array-index-key
                                  key={index}
                                  style={styles.emojisWithTextFontSize}
                              >
                                  {text}
                              </Text>
                          ) : (
                              text
                          ),
                      )
                    : fragmentText}
            </Text>
        </UserDetailsTooltip>
    );
}

ReportActionItemMessageHeaderSender.displayName = 'ReportActionItemMessageHeaderSender';

export default ReportActionItemMessageHeaderSender;
