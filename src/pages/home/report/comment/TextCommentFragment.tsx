import Str from 'expensify-common/lib/str';
import {isEmpty} from 'lodash';
import React, {memo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import ZeroWidthView from '@components/ZeroWidthView';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import convertToLTR from '@libs/convertToLTR';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as EmojiUtils from '@libs/EmojiUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {OriginalMessageSource} from '@src/types/onyx/OriginalMessage';
import type {Message} from '@src/types/onyx/ReportAction';
import RenderCommentHTML from './RenderCommentHTML';

type TextCommentFragmentProps = {
    /** The reportAction's source */
    source: OriginalMessageSource;

    /** The message fragment needing to be displayed */
    fragment: Message;

    /** Should this message fragment be styled as deleted? */
    styleAsDeleted: boolean;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** Additional styles to add after local styles. */
    style: StyleProp<TextStyle>;

    /** Text of an IOU report action */
    iouMessage?: string;
};

function TextCommentFragment({fragment, styleAsDeleted, source, style, displayAsGroup, iouMessage = ''}: TextCommentFragmentProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {html = '', text} = fragment;
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    // If the only difference between fragment.text and fragment.html is <br /> tags
    // we render it as text, not as html.
    // This is done to render emojis with line breaks between them as text.
    const differByLineBreaksOnly = Str.replaceAll(html, '<br />', '\n') === text;

    // Only render HTML if we have html in the fragment
    if (!differByLineBreaksOnly) {
        const editedTag = fragment.isEdited ? `<edited ${styleAsDeleted ? 'deleted' : ''}></edited>` : '';
        const htmlContent = styleAsDeleted ? `<del>${html}</del>` : html;

        const htmlWithTag = editedTag ? `${htmlContent}${editedTag}` : htmlContent;

        return (
            <RenderCommentHTML
                source={source}
                html={htmlWithTag}
            />
        );
    }

    const containsOnlyEmojis = EmojiUtils.containsOnlyEmojis(text);
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
                    !DeviceCapabilities.canUseTouchScreen() || !isSmallScreenWidth ? styles.userSelectText : styles.userSelectNone,
                ]}
            >
                {convertToLTR(message)}
            </Text>
            {fragment.isEdited && (
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
