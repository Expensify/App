import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Avatar from '@components/Avatar';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import SubscriptAvatar from '@components/SubscriptAvatar';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import ControlSelection from '@libs/ControlSelection';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import reportPropTypes from '@pages/reportPropTypes';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import ReportActionItemDate from './ReportActionItemDate';
import ReportActionItemFragment from './ReportActionItemFragment';
import reportActionPropTypes from './reportActionPropTypes';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

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
    wrapperStyles: [styles.chatItem],
    showHeader: true,
    shouldShowSubscriptAvatar: false,
    hasBeenFlagged: false,
    report: undefined,
    iouReport: undefined,
    isHovered: false,
};

const showUserDetails = (accountID) => {
    Navigation.navigate(ROUTES.PROFILE.getRoute(accountID));
};

const showWorkspaceDetails = (reportID) => {
    Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID));
};

function ReportActionItemSingle(props) {
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const actorAccountID = props.action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW && props.iouReport ? props.iouReport.managerID : props.action.actorAccountID;
    let displayName = ReportUtils.getDisplayNameForParticipant(actorAccountID);
    const {avatar, login, pendingFields, status, fallbackIcon} = personalDetails[actorAccountID] || {};
    let actorHint = (login || displayName || '').replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, '');
    const displayAllActors = useMemo(() => props.action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW && props.iouReport, [props.action.actionName, props.iouReport]);
    const isWorkspaceActor = ReportUtils.isPolicyExpenseChat(props.report) && (!actorAccountID || displayAllActors);
    let avatarSource = UserUtils.getAvatar(avatar, actorAccountID);

    if (isWorkspaceActor) {
        displayName = ReportUtils.getPolicyName(props.report);
        actorHint = displayName;
        avatarSource = ReportUtils.getWorkspaceAvatar(props.report);
    } else if (props.action.delegateAccountID && personalDetails[props.action.delegateAccountID]) {
        // We replace the actor's email, name, and avatar with the Copilot manually for now. And only if we have their
        // details. This will be improved upon when the Copilot feature is implemented.
        const delegateDetails = personalDetails[props.action.delegateAccountID];
        const delegateDisplayName = delegateDetails.displayName;
        actorHint = `${delegateDisplayName} (${props.translate('reportAction.asCopilot')} ${displayName})`;
        displayName = actorHint;
        avatarSource = UserUtils.getAvatar(delegateDetails.avatar, props.action.delegateAccountID);
    }

    // If this is a report preview, display names and avatars of both people involved
    let secondaryAvatar = {};
    const primaryDisplayName = displayName;
    if (displayAllActors) {
        // The ownerAccountID and actorAccountID can be the same if the a user requests money back from the IOU's original creator, in that case we need to use managerID to avoid displaying the same user twice
        const secondaryAccountId = props.iouReport.ownerAccountID === actorAccountID ? props.iouReport.managerID : props.iouReport.ownerAccountID;
        const secondaryUserDetails = personalDetails[secondaryAccountId] || {};
        const secondaryDisplayName = ReportUtils.getDisplayNameForParticipant(secondaryAccountId);
        displayName = `${primaryDisplayName} & ${secondaryDisplayName}`;
        secondaryAvatar = {
            source: UserUtils.getAvatar(secondaryUserDetails.avatar, secondaryAccountId),
            type: CONST.ICON_TYPE_AVATAR,
            name: secondaryDisplayName,
            id: secondaryAccountId,
        };
    } else if (!isWorkspaceActor) {
        const avatarIconIndex = props.report.isOwnPolicyExpenseChat || ReportUtils.isPolicyExpenseChat(props.report) ? 0 : 1;
        const reportIcons = ReportUtils.getIcons(props.report, {});

        secondaryAvatar = reportIcons[avatarIconIndex];
    }
    const icon = {source: avatarSource, type: isWorkspaceActor ? CONST.ICON_TYPE_WORKSPACE : CONST.ICON_TYPE_AVATAR, name: primaryDisplayName, id: isWorkspaceActor ? '' : actorAccountID};

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

    const reportID = props.report && props.report.reportID;
    const iouReportID = props.iouReport && props.iouReport.reportID;

    const showActorDetails = useCallback(() => {
        if (isWorkspaceActor) {
            showWorkspaceDetails(reportID);
        } else {
            // Show participants page IOU report preview
            if (displayAllActors) {
                Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(iouReportID));
                return;
            }
            showUserDetails(props.action.delegateAccountID ? props.action.delegateAccountID : actorAccountID);
        }
    }, [isWorkspaceActor, reportID, actorAccountID, props.action.delegateAccountID, iouReportID, displayAllActors]);

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
                        fallbackIcon={fallbackIcon}
                    />
                </View>
            </UserDetailsTooltip>
        );
    };
    const hasEmojiStatus = !displayAllActors && status && status.emojiCode;
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
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
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
                            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        >
                            {_.map(personArray, (fragment, index) => (
                                <ReportActionItemFragment
                                    key={`person-${props.action.reportActionID}-${index}`}
                                    accountID={actorAccountID}
                                    fragment={fragment}
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

export default withLocalize(ReportActionItemSingle);
