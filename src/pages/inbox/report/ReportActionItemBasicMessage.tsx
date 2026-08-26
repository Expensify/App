import {useTemporarySystemMessageTypography} from '@components/TemporarySystemMessageTypographyContext';
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
    const selectableStyle = !canUseTouchScreen() || !shouldUseNarrowLayout ? styles.userSelectText : styles.userSelectNone;
    const temporaryTypography = useTemporarySystemMessageTypography();
    const temporaryTypographyStyle = temporaryTypography === 'micro' ? styles.textMicroSupporting : undefined;

    return (
        <View>
            {!!message &&
                (messageContainsCustomEmojiWithText ? (
                    <TextWithEmojiFragment
                        message={Str.htmlDecode(message)}
                        style={[styles.chatItemMessage, styles.colorMuted, selectableStyle, temporaryTypographyStyle]}
                        alignCustomEmoji
                    />
                ) : (
                    <Text style={[styles.chatItemMessage, styles.colorMuted, selectableStyle, temporaryTypographyStyle]}>{Str.htmlDecode(message)}</Text>
                ))}
            {children}
        </View>
    );
}

export default ReportActionItemBasicMessage;
