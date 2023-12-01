import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React, {memo} from 'react';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import ZeroWidthView from '@components/ZeroWidthView';
import compose from '@libs/compose';
import convertToLTR from '@libs/convertToLTR';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as EmojiUtils from '@libs/EmojiUtils';
import reportActionFragmentPropTypes from '@pages/home/report/reportActionFragmentPropTypes';
import reportActionSourcePropType from '@pages/home/report/reportActionSourcePropType';
import editedLabelStyles from '@styles/editedLabelStyles';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import RenderCommentHTML from './RenderCommentHTML';

const propTypes = {
    /** The reportAction's source */
    source: reportActionSourcePropType.isRequired,

    /** The message fragment needing to be displayed */
    fragment: reportActionFragmentPropTypes.isRequired,

    /** Should this message fragment be styled as deleted? */
    styleAsDeleted: PropTypes.bool.isRequired,

    /** Text of an IOU report action */
    iouMessage: PropTypes.string,

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: PropTypes.bool.isRequired,

    /** Additional styles to add after local styles. */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]).isRequired,

    ...windowDimensionsPropTypes,

    /** localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    iouMessage: undefined,
};

function TextCommentFragment(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {fragment, styleAsDeleted} = props;
    const {html, text} = fragment;

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
                source={props.source}
                html={htmlWithTag}
            />
        );
    }

    const containsOnlyEmojis = EmojiUtils.containsOnlyEmojis(text);

    return (
        <Text style={[containsOnlyEmojis ? styles.onlyEmojisText : undefined, styles.ltr, ...props.style]}>
            <ZeroWidthView
                text={text}
                displayAsGroup={props.displayAsGroup}
            />
            <Text
                style={[
                    containsOnlyEmojis ? styles.onlyEmojisText : undefined,
                    styles.ltr,
                    ...props.style,
                    styleAsDeleted ? styles.offlineFeedback.deleted : undefined,
                    !DeviceCapabilities.canUseTouchScreen() || !props.isSmallScreenWidth ? styles.userSelectText : styles.userSelectNone,
                ]}
            >
                {convertToLTR(props.iouMessage || text)}
            </Text>
            {Boolean(fragment.isEdited) && (
                <>
                    <Text
                        style={[containsOnlyEmojis ? styles.onlyEmojisTextLineHeight : undefined, styles.userSelectNone]}
                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                    >
                        {' '}
                    </Text>
                    <Text
                        fontSize={variables.fontSizeSmall}
                        color={theme.textSupporting}
                        style={[editedLabelStyles, styleAsDeleted ? styles.offlineFeedback.deleted : undefined, ...props.style]}
                    >
                        {props.translate('reportActionCompose.edited')}
                    </Text>
                </>
            )}
        </Text>
    );
}

TextCommentFragment.propTypes = propTypes;
TextCommentFragment.defaultProps = defaultProps;
TextCommentFragment.displayName = 'TextCommentFragment';

export default compose(withWindowDimensions, withLocalize)(memo(TextCommentFragment));
