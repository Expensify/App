import {Str} from 'expensify-common';
import isEmpty from 'lodash/isEmpty';
import React, {memo, useEffect} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import ZeroWidthView from '@components/ZeroWidthView';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as EmojiUtils from '@libs/EmojiUtils';
import Performance from '@libs/Performance';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {OriginalMessageSource} from '@src/types/onyx/OriginalMessage';
import type {Message} from '@src/types/onyx/ReportAction';
import RenderCommentHTML from './RenderCommentHTML';
import shouldRenderAsText from './shouldRenderAsText';

type TextCommentFragmentProps = {
    /** The reportAction's source */
    source: OriginalMessageSource;

    /** The message fragment needing to be displayed */
    fragment: Message | undefined;

    /** Should this message fragment be styled as deleted? */
    styleAsDeleted: boolean;

    /** Should this message fragment be styled as muted */
    styleAsMuted?: boolean;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** Additional styles to add after local styles. */
    style: StyleProp<TextStyle>;

    /** Text of an IOU report action */
    iouMessage?: string;
};

function TextCommentFragment({fragment, styleAsDeleted, styleAsMuted = false, source, style, displayAsGroup, iouMessage = ''}: TextCommentFragmentProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {html = '', text} = fragment ?? {};
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useEffect(() => {
        Performance.markEnd(CONST.TIMING.MESSAGE_SENT, {message: text});
    }, [text]);

    // If the only difference between fragment.text and fragment.html is <br /> tags and emoji tag
    // on native, we render it as text, not as html
    // on other device, only render it as text if the only difference is <br /> tag
    const containsOnlyEmojis = EmojiUtils.containsOnlyEmojis(text ?? '');
    if (!shouldRenderAsText(html, text ?? '') && !(containsOnlyEmojis && styleAsDeleted)) {
        const editedTag = fragment?.isEdited ? `<edited ${styleAsDeleted ? 'deleted' : ''} ${containsOnlyEmojis ? 'islarge' : ''}></edited>` : '';
        const htmlWithDeletedTag = styleAsDeleted ? `<del>${html}</del>` : html;

        let htmlContent = htmlWithDeletedTag;
        if (containsOnlyEmojis) {
            htmlContent = Str.replaceAll(htmlContent, '<emoji>', '<emoji islarge>');
            htmlContent = Str.replaceAll(htmlContent, '<blockquote>', '<blockquote isemojisonly>');
        }
        let htmlWithTag = editedTag ? `${htmlContent}${editedTag}` : htmlContent;

        if (styleAsMuted) {
            htmlWithTag = `<muted-text>${htmlWithTag}<muted-text>`;
        }

        return (
            <RenderCommentHTML
                source={source}
                html={htmlWithTag}
            />
        );
    }

    const message = isEmpty(iouMessage) ? text : iouMessage;

    return (
        <Text style={[containsOnlyEmojis && styles.onlyEmojisText, styles.ltr, style]}>
            <ZeroWidthView
                text={text}
                displayAsGroup={displayAsGroup}
            />
            <Text
                style={[
                    containsOnlyEmojis ? styles.onlyEmojisText : undefined,
                    styles.ltr,
                    style,
                    styleAsDeleted ? styles.offlineFeedback.deleted : undefined,
                    styleAsMuted ? styles.colorMuted : undefined,
                    !DeviceCapabilities.canUseTouchScreen() || !shouldUseNarrowLayout ? styles.userSelectText : styles.userSelectNone,
                ]}
            >
                {convertToLTR(message ?? '')}
            </Text>
            {fragment?.isEdited && (
                <>
                    <Text
                        style={[containsOnlyEmojis && styles.onlyEmojisTextLineHeight, styles.userSelectNone]}
                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                    >
                        {' '}
                    </Text>
                    <Text
                        fontSize={variables.fontSizeSmall}
                        color={theme.textSupporting}
                        style={[styles.editedLabelStyles, styleAsDeleted && styles.offlineFeedback.deleted, style]}
                    >
                        {translate('reportActionCompose.edited')}
                    </Text>
                </>
            )}
        </Text>
    );
}

TextCommentFragment.displayName = 'TextCommentFragment';

export default memo(TextCommentFragment);
