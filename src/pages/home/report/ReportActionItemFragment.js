import React, {memo} from 'react';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import reportActionFragmentPropTypes from './reportActionFragmentPropTypes';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import themeColors from '../../../styles/themes/default';
import RenderHTML from '../../../components/RenderHTML';
import Text from '../../../components/Text';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import compose from '../../../libs/compose';
import convertToLTR from '../../../libs/convertToLTR';
import {withNetwork} from '../../../components/OnyxProvider';
import CONST from '../../../CONST';
import editedLabelStyles from '../../../styles/editedLabelStyles';
import UserDetailsTooltip from '../../../components/UserDetailsTooltip';
import avatarPropTypes from '../../../components/avatarPropTypes';
import ZeroWidthView from '../../../components/ZeroWidthView';

const propTypes = {
    /** Users accountID */
    accountID: PropTypes.number.isRequired,

    /** The message fragment needing to be displayed */
    fragment: reportActionFragmentPropTypes.isRequired,

    /** If this fragment is attachment than has info? */
    attachmentInfo: PropTypes.shape({
        /** The file name of attachment */
        name: PropTypes.string,

        /** The file size of the attachment in bytes. */
        size: PropTypes.number,

        /** The MIME type of the attachment. */
        type: PropTypes.string,

        /** Attachment's URL represents the specified File object or Blob object  */
        source: PropTypes.string,
    }),

    /** Message(text) of an IOU report action */
    iouMessage: PropTypes.string,

    /** The reportAction's source */
    source: PropTypes.oneOf(['Chronos', 'email', 'ios', 'android', 'web', 'email', '']),

    /** Should this fragment be contained in a single line? */
    isSingleLine: PropTypes.bool,

    // Additional styles to add after local styles
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** The accountID of the copilot who took this action on behalf of the user */
    delegateAccountID: PropTypes.number,

    /** icon */
    actorIcon: avatarPropTypes,

    /** Whether the comment is a thread parent message/the first message in a thread */
    isThreadParentMessage: PropTypes.bool,

    ...windowDimensionsPropTypes,

    /** localization props */
    ...withLocalizePropTypes,

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: PropTypes.bool,
};

const defaultProps = {
    attachmentInfo: {
        name: '',
        size: 0,
        type: '',
        source: '',
    },
    iouMessage: '',
    isSingleLine: false,
    source: '',
    style: [],
    delegateAccountID: 0,
    actorIcon: {},
    isThreadParentMessage: false,
    displayAsGroup: false,
};

function ReportActionItemFragment(props) {
    switch (props.fragment.type) {
        case 'COMMENT': {
            const {html, text} = props.fragment;
            const isPendingDelete = props.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && props.network.isOffline;

            // Threaded messages display "[Deleted message]" instead of being hidden altogether.
            // While offline we display the previous message with a strikethrough style. Once online we want to
            // immediately display "[Deleted message]" while the delete action is pending.

            if ((!props.network.isOffline && props.isThreadParentMessage && props.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) || props.fragment.isDeletedParentAction) {
                return <RenderHTML html={`<comment>${props.translate('parentReportAction.deletedMessage')}</comment>`} />;
            }

            // If the only difference between fragment.text and fragment.html is <br /> tags
            // we render it as text, not as html.
            // This is done to render emojis with line breaks between them as text.
            const differByLineBreaksOnly = Str.replaceAll(html, '<br />', '\n') === text;

            // Only render HTML if we have html in the fragment
            if (!differByLineBreaksOnly) {
                const editedTag = props.fragment.isEdited ? `<edited ${isPendingDelete ? 'deleted' : ''}></edited>` : '';
                const htmlContent = isPendingDelete ? `<del>${html}</del>` : html;

                const htmlWithTag = editedTag ? `${htmlContent}${editedTag}` : htmlContent;

                return <RenderHTML html={props.source === 'email' ? `<email-comment>${htmlWithTag}</email-comment>` : `<comment>${htmlWithTag}</comment>`} />;
            }
            const containsOnlyEmojis = EmojiUtils.containsOnlyEmojis(text);

            return (
                <Text style={[containsOnlyEmojis ? styles.onlyEmojisText : undefined, styles.ltr, ...props.style]}>
                    <ZeroWidthView
                        text={text}
                        displayAsGroup={props.displayAsGroup}
                    />
                    <Text
                        selectable={!DeviceCapabilities.canUseTouchScreen() || !props.isSmallScreenWidth}
                        style={[containsOnlyEmojis ? styles.onlyEmojisText : undefined, styles.ltr, ...props.style, isPendingDelete ? styles.offlineFeedback.deleted : undefined]}
                    >
                        {convertToLTR(props.iouMessage || text)}
                    </Text>
                    {Boolean(props.fragment.isEdited) && (
                        <>
                            <Text
                                selectable={false}
                                style={[containsOnlyEmojis ? styles.onlyEmojisTextLineHeight : undefined, styles.userSelectNone]}
                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            >
                                {' '}
                            </Text>
                            <Text
                                fontSize={variables.fontSizeSmall}
                                color={themeColors.textSupporting}
                                style={[editedLabelStyles, isPendingDelete ? styles.offlineFeedback.deleted : undefined, ...props.style]}
                            >
                                {props.translate('reportActionCompose.edited')}
                            </Text>
                        </>
                    )}
                </Text>
            );
        }
        case 'TEXT':
            return (
                <UserDetailsTooltip
                    accountID={props.accountID}
                    delegateAccountID={props.delegateAccountID}
                    icon={props.actorIcon}
                >
                    <Text
                        numberOfLines={props.isSingleLine ? 1 : undefined}
                        style={[styles.chatItemMessageHeaderSender, props.isSingleLine ? styles.pre : styles.preWrap]}
                    >
                        {props.fragment.text}
                    </Text>
                </UserDetailsTooltip>
            );
        case 'LINK':
            return <Text>LINK</Text>;
        case 'INTEGRATION_COMMENT':
            return <Text>REPORT_LINK</Text>;
        case 'REPORT_LINK':
            return <Text>REPORT_LINK</Text>;
        case 'POLICY_LINK':
            return <Text>POLICY_LINK</Text>;

        // If we have a message fragment type of OLD_MESSAGE this means we have not yet converted this over to the
        // new data structure. So we simply set this message as inner html and render it like we did before.
        // This wil allow us to convert messages over to the new structure without needing to do it all at once.
        case 'OLD_MESSAGE':
            return <Text>OLD_MESSAGE</Text>;
        default:
            return <Text>props.fragment.text</Text>;
    }
}

ReportActionItemFragment.propTypes = propTypes;
ReportActionItemFragment.defaultProps = defaultProps;
ReportActionItemFragment.displayName = 'ReportActionItemFragment';

export default compose(withWindowDimensions, withLocalize, withNetwork())(memo(ReportActionItemFragment));
