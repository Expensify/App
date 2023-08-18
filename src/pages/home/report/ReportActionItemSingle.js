import lodashGet from 'lodash/get';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import reportActionPropTypes from './reportActionPropTypes';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../styles/styles';
import ReportActionItemDate from './ReportActionItemDate';
import Avatar from '../../../components/Avatar';
import personalDetailsPropType from '../../personalDetailsPropType';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import {withPersonalDetails} from '../../../components/OnyxProvider';
import ControlSelection from '../../../libs/ControlSelection';
import * as ReportUtils from '../../../libs/ReportUtils';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import CONST from '../../../CONST';
import SubscriptAvatar from '../../../components/SubscriptAvatar';
import reportPropTypes from '../../reportPropTypes';
import * as UserUtils from '../../../libs/UserUtils';
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import UserDetailsTooltip from '../../../components/UserDetailsTooltip';
import MultipleAvatars from '../../../components/MultipleAvatars';
import * as StyleUtils from '../../../styles/StyleUtils';
import themeColors from '../../../styles/themes/default';
import Permissions from '../../../libs/Permissions';
import ONYXKEYS from '../../../ONYXKEYS';
import Text from '../../../components/Text';
import Tooltip from '../../../components/Tooltip';
import DateUtils from '../../../libs/DateUtils';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** All of the personalDetails */
    personalDetailsList: PropTypes.objectOf(personalDetailsPropType),

    /** Styles for the outermost View */
    // eslint-disable-next-line react/forbid-prop-types
    wrapperStyles: PropTypes.arrayOf(PropTypes.object),

    /** Children view component for this action item */
    children: PropTypes.node.isRequired,

    /** Report for this action */
    report: reportPropTypes,

    /** IOU Report for this action, if any */
    iouReport: reportPropTypes,

    /** Show header for action */
    showHeader: PropTypes.bool,

    /** Determines if the avatar is displayed as a subscript (positioned lower than normal) */
    shouldShowSubscriptAvatar: PropTypes.bool,

    /** If the message has been flagged for moderation */
    hasBeenFlagged: PropTypes.bool,

    /** If the action is being hovered */
    isHovered: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetailsList: {},
    wrapperStyles: [styles.chatItem],
    showHeader: true,
    shouldShowSubscriptAvatar: false,
    hasBeenFlagged: false,
    report: undefined,
    iouReport: undefined,
    isHovered: false,
};

const showUserDetails = (accountID) => {
    Navigation.navigate(ROUTES.getProfileRoute(accountID));
};

const showWorkspaceDetails = (reportID) => {
    Navigation.navigate(ROUTES.getReportDetailsRoute(reportID));
};

function ReportActionItemSingle(props) {
    const actorAccountID = props.action.actorAccountID;
    let {displayName} = props.personalDetailsList[actorAccountID] || {};
    const {avatar, login, pendingFields, status} = props.personalDetailsList[actorAccountID] || {};
    let actorHint = (login || displayName || '').replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, '');
    const isWorkspaceActor = ReportUtils.isPolicyExpenseChat(props.report) && !actorAccountID;
    let avatarSource = UserUtils.getAvatar(avatar, actorAccountID);

    if (isWorkspaceActor) {
        displayName = ReportUtils.getPolicyName(props.report);
        actorHint = displayName;
        avatarSource = ReportUtils.getWorkspaceAvatar(props.report);
    } else if (props.action.delegateAccountID && props.personalDetailsList[props.action.delegateAccountID]) {
        // We replace the actor's email, name, and avatar with the Copilot manually for now. And only if we have their
        // details. This will be improved upon when the Copilot feature is implemented.
        const delegateDetails = props.personalDetailsList[props.action.delegateAccountID];
        const delegateDisplayName = delegateDetails.displayName;
        actorHint = `${delegateDisplayName} (${props.translate('reportAction.asCopilot')} ${displayName})`;
        displayName = actorHint;
        avatarSource = UserUtils.getAvatar(delegateDetails.avatar, props.action.delegateAccountID);
    }

    // If this is a report preview, display names and avatars of both people involved
    let secondaryAvatar = {};
    const displayAllActors = props.action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW && props.iouReport;
    const primaryDisplayName = displayName;
    if (displayAllActors) {
        const secondaryUserDetails = props.personalDetailsList[props.iouReport.ownerAccountID] || {};
        const secondaryDisplayName = lodashGet(secondaryUserDetails, 'displayName', '');
        displayName = `${primaryDisplayName} & ${secondaryDisplayName}`;
        secondaryAvatar = {
            source: UserUtils.getAvatar(secondaryUserDetails.avatar, props.iouReport.ownerAccountID),
            type: CONST.ICON_TYPE_AVATAR,
            name: secondaryDisplayName,
            id: props.iouReport.ownerAccountID,
        };
    } else if (!isWorkspaceActor) {
        secondaryAvatar = ReportUtils.getIcons(props.report, {})[props.report.isOwnPolicyExpenseChat ? 0 : 1];
    }
    const icon = {source: avatarSource, type: isWorkspaceActor ? CONST.ICON_TYPE_WORKSPACE : CONST.ICON_TYPE_AVATAR, name: primaryDisplayName, id: actorAccountID};

    // Since the display name for a report action message is delivered with the report history as an array of fragments
    // we'll need to take the displayName from personal details and have it be in the same format for now. Eventually,
    // we should stop referring to the report history items entirely for this information.
    const personArray = displayName
        ? [
              {
                  type: 'TEXT',
                  text: displayName,
              },
          ]
        : props.action.person;

    const showActorDetails = useCallback(() => {
        if (isWorkspaceActor) {
            showWorkspaceDetails(props.report.reportID);
        } else {
            showUserDetails(props.action.delegateAccountID ? props.action.delegateAccountID : actorAccountID);
        }
    }, [isWorkspaceActor, props.report.reportID, actorAccountID, props.action.delegateAccountID]);

    const shouldDisableDetailPage = useMemo(
        () => !isWorkspaceActor && ReportUtils.isOptimisticPersonalDetail(props.action.delegateAccountID ? props.action.delegateAccountID : actorAccountID),
        [props.action, isWorkspaceActor, actorAccountID],
    );

    const getAvatar = () => {
        if (displayAllActors) {
            return (
                <MultipleAvatars
                    icons={[icon, secondaryAvatar]}
                    isInReportAction
                    shouldShowTooltip
                    secondAvatarStyle={[
                        StyleUtils.getBackgroundAndBorderStyle(themeColors.appBG),
                        props.isHovered ? StyleUtils.getBackgroundAndBorderStyle(themeColors.highlightBG) : undefined,
                    ]}
                />
            );
        }
        if (props.shouldShowSubscriptAvatar) {
            return (
                <SubscriptAvatar
                    mainAvatar={icon}
                    secondaryAvatar={secondaryAvatar}
                    mainTooltip={actorHint}
                    secondaryTooltip={ReportUtils.getPolicyName(props.report)}
                    noMargin
                />
            );
        }
        return (
            <UserDetailsTooltip
                accountID={actorAccountID}
                delegateAccountID={props.action.delegateAccountID}
                icon={icon}
            >
                <View>
                    <Avatar
                        containerStyles={[styles.actionAvatar]}
                        source={icon.source}
                        type={icon.type}
                        name={icon.name}
                    />
                </View>
            </UserDetailsTooltip>
        );
    };
    const hasEmojiStatus = !displayAllActors && status && status.emojiCode && Permissions.canUseCustomStatus(props.betas);
    const formattedDate = DateUtils.getStatusUntilDate(lodashGet(status, 'clearAfter'));
    const statusText = lodashGet(status, 'text', '');
    const statusTooltipText = formattedDate ? `${statusText} (${formattedDate})` : statusText;

    return (
        <View style={props.wrapperStyles}>
            <PressableWithoutFeedback
                style={[styles.alignSelfStart, styles.mr3]}
                onPressIn={ControlSelection.block}
                onPressOut={ControlSelection.unblock}
                onPress={showActorDetails}
                disabled={shouldDisableDetailPage}
                accessibilityLabel={actorHint}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <OfflineWithFeedback pendingAction={lodashGet(pendingFields, 'avatar', null)}>{getAvatar()}</OfflineWithFeedback>
            </PressableWithoutFeedback>
            <View style={[styles.chatItemRight]}>
                {props.showHeader ? (
                    <View style={[styles.chatItemMessageHeader]}>
                        <PressableWithoutFeedback
                            style={[styles.flexShrink1, styles.mr1]}
                            onPressIn={ControlSelection.block}
                            onPressOut={ControlSelection.unblock}
                            onPress={showActorDetails}
                            disabled={shouldDisableDetailPage}
                            accessibilityLabel={actorHint}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        >
                            {_.map(personArray, (fragment, index) => (
                                <ReportActionItemFragment
                                    key={`person-${props.action.reportActionID}-${index}`}
                                    accountID={actorAccountID}
                                    fragment={fragment}
                                    isAttachment={props.action.isAttachment}
                                    isLoading={props.action.isLoading}
                                    delegateAccountID={props.action.delegateAccountID}
                                    isSingleLine
                                    actorIcon={icon}
                                />
                            ))}
                        </PressableWithoutFeedback>
                        {Boolean(hasEmojiStatus) && (
                            <Tooltip text={statusTooltipText}>
                                <Text
                                    style={styles.userReportStatusEmoji}
                                    numberOfLines={1}
                                >{`${status.emojiCode}`}</Text>
                            </Tooltip>
                        )}
                        <ReportActionItemDate created={props.action.created} />
                    </View>
                ) : null}
                <View style={props.hasBeenFlagged ? styles.blockquote : {}}>{props.children}</View>
            </View>
        </View>
    );
}

ReportActionItemSingle.propTypes = propTypes;
ReportActionItemSingle.defaultProps = defaultProps;
ReportActionItemSingle.displayName = 'ReportActionItemSingle';

export default compose(
    withLocalize,
    withPersonalDetails(),
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(ReportActionItemSingle);
