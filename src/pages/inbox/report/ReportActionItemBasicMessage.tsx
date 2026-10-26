import Text from '@components/Text';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/EmojiUtils';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';

import TextWithEmojiFragment from './comment/TextWithEmojiFragment';

type ReportActionItemBasicMessageProps = Partial<ChildrenProps> & {
    message?: string;
};

function ReportActionItemBasicMessage({message, children}: ReportActionItemBasicMessageProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const messageContainsCustomEmojiWithText = useMemo(() => containsCustomEmoji(message) && !containsOnlyCustomEmoji(message), [message]);
    // Desktop web: stretch the message so a drag can start in the empty space beside a short line.
    const canSelectMessageText = !canUseTouchScreen() || !shouldUseNarrowLayout;
    const selectableStyle = canSelectMessageText ? [styles.userSelectText, styles.alignSelfStretch, styles.w100] : styles.userSelectNone;

    return (
        <View style={[styles.renderHTML, selectableStyle]}>
            {!!message &&
                (messageContainsCustomEmojiWithText ? (
                    <TextWithEmojiFragment
                        message={Str.htmlDecode(message)}
                        style={[styles.chatItemMessage, styles.colorMuted, selectableStyle]}
                        alignCustomEmoji
                    />
                ) : (
                    <Text style={[styles.chatItemMessage, styles.colorMuted, selectableStyle]}>{Str.htmlDecode(message)}</Text>
                ))}
            {children}
        </View>
    );
}

export default ReportActionItemBasicMessage;
