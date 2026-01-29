import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/EmojiUtils';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import TextWithEmojiFragment from './comment/TextWithEmojiFragment';

type ReportActionItemBasicMessageProps = Partial<ChildrenProps> & {
    message?: string;
};

function ReportActionItemBasicMessage({message, children}: ReportActionItemBasicMessageProps) {
    const styles = useThemeStyles();
    const messageContainsCustomEmojiWithText = useMemo(() => containsCustomEmoji(message) && !containsOnlyCustomEmoji(message), [message]);

    return (
        <View>
            {!!message &&
                (messageContainsCustomEmojiWithText ? (
                    <TextWithEmojiFragment
                        message={Str.htmlDecode(message)}
                        style={[styles.chatItemMessage, styles.colorMuted]}
                        alignCustomEmoji
                    />
                ) : (
                    <Text style={[styles.chatItemMessage, styles.colorMuted]}>{Str.htmlDecode(message)}</Text>
                ))}
            {children}
        </View>
    );
}

export default ReportActionItemBasicMessage;
