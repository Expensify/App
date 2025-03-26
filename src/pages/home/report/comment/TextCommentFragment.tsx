import {Str} from 'expensify-common';
import isEmpty from 'lodash/isEmpty';
import React, {memo, useEffect, useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import ZeroWidthView from '@components/ZeroWidthView';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {containsOnlyEmojis as containsOnlyEmojisUtil, splitTextWithEmojis} from '@libs/EmojiUtils';
import Performance from '@libs/Performance';
import {getHtmlWithAttachmentID, getTextFromHtml} from '@libs/ReportActionsUtils';
import variables from '@styles/variables';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import type {OriginalMessageSource} from '@src/types/onyx/OriginalMessage';
import type {Message} from '@src/types/onyx/ReportAction';
import RenderCommentHTML from './RenderCommentHTML';
import shouldRenderAsText from './shouldRenderAsText';
import TextWithEmojiFragment from './TextWithEmojiFragment';

type TextCommentFragmentProps = {
    /** The reportAction's source */
    source: OriginalMessageSource;

    /** The report action's id */
    reportActionID?: string;

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

function TextCommentFragment({fragment, styleAsDeleted, reportActionID, styleAsMuted = false, source, style, displayAsGroup, iouMessage = ''}: TextCommentFragmentProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {html = ''} = fragment ?? {};
    const text = getTextFromHtml(html);
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const message = isEmpty(iouMessage) ? text : iouMessage;

    const processedTextArray = useMemo(() => splitTextWithEmojis(message), [message]);

    useEffect(() => {
        Performance.markEnd(CONST.TIMING.SEND_MESSAGE, {message: text});
        Timing.end(CONST.TIMING.SEND_MESSAGE);
    }, [text]);

    // If the only difference between fragment.text and fragment.html is <br /> tags and emoji tag
    // on native, we render it as text, not as html
    // on other device, only render it as text if the only difference is <br /> tag
    const containsOnlyEmojis = containsOnlyEmojisUtil(text ?? '');
    const containsEmojis = CONST.REGEX.ALL_EMOJIS.test(text ?? '');
    if (!shouldRenderAsText(html, text ?? '') && !(containsOnlyEmojis && styleAsDeleted)) {
        const editedTag = fragment?.isEdited ? `<edited ${styleAsDeleted ? 'deleted' : ''}></edited>` : '';
        const htmlWithDeletedTag = styleAsDeleted ? `<del>${html}</del>` : html;

        let htmlContent = htmlWithDeletedTag;
        if (containsOnlyEmojis) {
            htmlContent = Str.replaceAll(htmlContent, '<emoji>', '<emoji islarge>');
        } else if (containsEmojis) {
            htmlContent = Str.replaceAll(htmlWithDeletedTag, '<emoji>', '<emoji ismedium>');
        }

        let htmlWithTag = editedTag ? `${htmlContent}${editedTag}` : htmlContent;

        if (styleAsMuted) {
            htmlWithTag = `<muted-text>${htmlWithTag}<muted-text>`;
        }

        htmlWithTag = getHtmlWithAttachmentID(htmlWithTag, reportActionID);

        return (
            <RenderCommentHTML
                containsOnlyEmojis={containsOnlyEmojis}
                source={source}
                html={htmlWithTag}
            />
        );
    }

    return (
        <Text style={[containsOnlyEmojis && styles.onlyEmojisText, styles.ltr, style]}>
            <ZeroWidthView
                text={text}
                displayAsGroup={displayAsGroup}
            />
            {processedTextArray.length !== 0 && !containsOnlyEmojis ? (
                <TextWithEmojiFragment
                    message={message}
                    style={[
                        styles.ltr,
                        style,
                        styleAsDeleted ? styles.offlineFeedback.deleted : undefined,
                        styleAsMuted ? styles.colorMuted : undefined,
                        !canUseTouchScreen() || !shouldUseNarrowLayout ? styles.userSelectText : styles.userSelectNone,
                    ]}
                />
            ) : (
                <Text
                    style={[
                        containsOnlyEmojis ? styles.onlyEmojisText : undefined,
                        styles.ltr,
                        style,
                        styleAsDeleted ? styles.offlineFeedback.deleted : undefined,
                        styleAsMuted ? styles.colorMuted : undefined,
                        !canUseTouchScreen() || !shouldUseNarrowLayout ? styles.userSelectText : styles.userSelectNone,
                    ]}
                >
                    {convertToLTR(message ?? '')}
                </Text>
            )}
            {!!fragment?.isEdited && (
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
