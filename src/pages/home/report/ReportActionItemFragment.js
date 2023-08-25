import React, {memo} from 'react';
import {ActivityIndicator, View} from 'react-native';
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
import applyStrikethrough from '../../../components/HTMLEngineProvider/applyStrikethrough';
import editedLabelStyles from '../../../styles/editedLabelStyles';
import UserDetailsTooltip from '../../../components/UserDetailsTooltip';
import avatarPropTypes from '../../../components/avatarPropTypes';

const propTypes = {
    /** Users accountID */
    accountID: PropTypes.number.isRequired,

    /** The message fragment needing to be displayed */
    fragment: reportActionFragmentPropTypes.isRequired,

    /** Is this fragment an attachment? */
    isAttachment: PropTypes.bool,

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

    /** Does this fragment belong to a reportAction that has not yet loaded? */
    loading: PropTypes.bool,

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

    ...windowDimensionsPropTypes,

    /** localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    isAttachment: false,
    attachmentInfo: {
        name: '',
        size: 0,
        type: '',
        source: '',
    },
    loading: false,
    isSingleLine: false,
    source: '',
    style: [],
    delegateAccountID: 0,
    actorIcon: {},
};

function ReportActionItemFragment(props) {
    switch (props.fragment.type) {
        case 'COMMENT': {
            // If this is an attachment placeholder, return the placeholder component
            if (props.isAttachment && props.loading) {
                return Str.isImage(props.attachmentInfo.name) ? (
                    <RenderHTML html={`<comment><img src="${props.attachmentInfo.source}" data-expensify-preview-modal-disabled="true"/></comment>`} />
                ) : (
                    <View style={[styles.chatItemAttachmentPlaceholder]}>
                        <ActivityIndicator
                            size="large"
                            color={themeColors.textSupporting}
                            style={[styles.flex1]}
                        />
                    </View>
                );
            }
            const {html, text} = props.fragment;

            // Threaded messages display "[Deleted message]" instead of being hidden altogether.
            // While offline we display the previous message with a strikethrough style. Once online we want to
            // immediately display "[Deleted message]" while the delete action is pending.

            if ((!props.network.isOffline && props.hasCommentThread && props.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) || props.fragment.isDeletedParentAction) {
                return <RenderHTML html={`<comment>${props.translate('parentReportAction.deletedMessage')}</comment>`} />;
            }

            // If the only difference between fragment.text and fragment.html is <br /> tags
            // we render it as text, not as html.
            // This is done to render emojis with line breaks between them as text.
            const differByLineBreaksOnly = Str.replaceAll(html, '<br />', '\n') === text;

            // Only render HTML if we have html in the fragment
            if (!differByLineBreaksOnly) {
                const isPendingDelete = props.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && props.network.isOffline;
                const editedTag = props.fragment.isEdited ? `<edited ${isPendingDelete ? 'deleted' : ''}></edited>` : '';
                const htmlContent = applyStrikethrough(html + editedTag, isPendingDelete);

                return <RenderHTML html={props.source === 'email' ? `<email-comment>${htmlContent}</email-comment>` : `<comment>${htmlContent}</comment>`} />;
            }
            const containsOnlyEmojis = EmojiUtils.containsOnlyEmojis(text);

            return (
                <Text
                    selectable={!DeviceCapabilities.canUseTouchScreen() || !props.isSmallScreenWidth}
                    style={[containsOnlyEmojis ? styles.onlyEmojisText : undefined, styles.ltr, ...props.style]}
                >
                    {convertToLTR(text)}
                    {Boolean(props.fragment.isEdited) && (
                        <Text
                            fontSize={variables.fontSizeSmall}
                            color={themeColors.textSupporting}
                            style={[editedLabelStyles, ...props.style]}
                        >
                            <Text
                                selectable={false}
                                style={[containsOnlyEmojis ? styles.onlyEmojisTextLineHeight : undefined, styles.w1, styles.userSelectNone]}
                            >
                                {' '}
                            </Text>
                            {props.translate('reportActionCompose.edited')}
                        </Text>
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
