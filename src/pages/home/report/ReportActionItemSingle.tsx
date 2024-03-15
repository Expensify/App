import React, {useCallback, useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import SubscriptAvatar from '@components/SubscriptAvatar';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import ReportActionItemDate from './ReportActionItemDate';
import ReportActionItemFragment from './ReportActionItemFragment';

type ReportActionItemSingleProps = Partial<ChildrenProps> & {
    /** All the data of the action */
    action: OnyxEntry<ReportAction>;

    /** Styles for the outermost View */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Report for this action */
    report: Report;

    /** IOU Report for this action, if any */
    iouReport?: OnyxEntry<Report>;

    /** Show header for action */
    showHeader?: boolean;

    /** Determines if the avatar is displayed as a subscript (positioned lower than normal) */
    shouldShowSubscriptAvatar?: boolean;

    /** If the message has been flagged for moderation */
    hasBeenFlagged?: boolean;

    /** If the action is being hovered */
    isHovered?: boolean;
};

const showUserDetails = (accountID: string) => {
    Navigation.navigate(ROUTES.PROFILE.getRoute(accountID));
};

const showWorkspaceDetails = (reportID: string) => {
    Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID));
};

function ReportActionItemSingle({
    action,
    children,
    wrapperStyle,
    showHeader = true,
    shouldShowSubscriptAvatar = false,
    hasBeenFlagged = false,
    report,
    iouReport,
    isHovered = false,
}: ReportActionItemSingleProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails() ?? CONST.EMPTY_OBJECT;
    const actorAccountID = action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW && iouReport ? iouReport.managerID : action?.actorAccountID;
    let displayName = ReportUtils.getDisplayNameForParticipant(actorAccountID);
    const {avatar, login, pendingFields, status, fallbackIcon} = personalDetails[actorAccountID ?? -1] ?? {};
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    let actorHint = (login || (displayName ?? '')).replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, '');
    const displayAllActors = useMemo(() => action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW && iouReport, [action?.actionName, iouReport]);
    const isWorkspaceActor = ReportUtils.isPolicyExpenseChat(report) && (!actorAccountID || displayAllActors);
    let avatarSource = UserUtils.getAvatar(avatar ?? '', actorAccountID);

    if (isWorkspaceActor) {
        displayName = ReportUtils.getPolicyName(report);
        actorHint = displayName;
        avatarSource = ReportUtils.getWorkspaceAvatar(report);
    } else if (action?.delegateAccountID && personalDetails[action?.delegateAccountID]) {
        // We replace the actor's email, name, and avatar with the Copilot manually for now. And only if we have their
        // details. This will be improved upon when the Copilot feature is implemented.
        const delegateDetails = personalDetails[action.delegateAccountID];
        const delegateDisplayName = delegateDetails?.displayName;
        actorHint = `${delegateDisplayName} (${translate('reportAction.asCopilot')} ${displayName})`;
        displayName = actorHint;
        avatarSource = UserUtils.getAvatar(delegateDetails?.avatar ?? '', Number(action.delegateAccountID));
    }

    // If this is a report preview, display names and avatars of both people involved
    let secondaryAvatar: Icon;
    const primaryDisplayName = displayName;
    if (displayAllActors) {
        // The ownerAccountID and actorAccountID can be the same if the a user requests money back from the IOU's original creator, in that case we need to use managerID to avoid displaying the same user twice
        const secondaryAccountId = iouReport?.ownerAccountID === actorAccountID ? iouReport?.managerID : iouReport?.ownerAccountID;
        const secondaryUserAvatar = personalDetails?.[secondaryAccountId ?? -1]?.avatar ?? '';
        const secondaryDisplayName = ReportUtils.getDisplayNameForParticipant(secondaryAccountId);
        displayName = `${primaryDisplayName} & ${secondaryDisplayName}`;
        secondaryAvatar = {
            source: UserUtils.getAvatar(secondaryUserAvatar, secondaryAccountId),
            type: CONST.ICON_TYPE_AVATAR,
            name: secondaryDisplayName ?? '',
            id: secondaryAccountId,
        };
    } else if (!isWorkspaceActor) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const avatarIconIndex = report.isOwnPolicyExpenseChat || ReportUtils.isPolicyExpenseChat(report) ? 0 : 1;
        const reportIcons = ReportUtils.getIcons(report, {});

        secondaryAvatar = reportIcons[avatarIconIndex];
    } else {
        secondaryAvatar = {name: '', source: '', type: 'avatar'};
    }
    const icon = {
        source: avatarSource,
        type: isWorkspaceActor ? CONST.ICON_TYPE_WORKSPACE : CONST.ICON_TYPE_AVATAR,
        name: primaryDisplayName ?? '',
        id: isWorkspaceActor ? '' : actorAccountID,
    };

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
        : action?.person;

    const reportID = report?.reportID;
    const iouReportID = iouReport?.reportID;

    const showActorDetails = useCallback(() => {
        if (isWorkspaceActor) {
            showWorkspaceDetails(reportID);
        } else {
            // Show participants page IOU report preview
            if (iouReportID && displayAllActors) {
                Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(iouReportID));
                return;
            }
            showUserDetails(action?.delegateAccountID ? String(action.delegateAccountID) : String(actorAccountID));
        }
    }, [isWorkspaceActor, reportID, actorAccountID, action?.delegateAccountID, iouReportID, displayAllActors]);

    const shouldDisableDetailPage = useMemo(
        () =>
            CONST.RESTRICTED_ACCOUNT_IDS.includes(actorAccountID ?? 0) ||
            (!isWorkspaceActor && ReportUtils.isOptimisticPersonalDetail(action?.delegateAccountID ? Number(action.delegateAccountID) : actorAccountID ?? -1)),
        [action, isWorkspaceActor, actorAccountID],
    );

    const getAvatar = () => {
        if (displayAllActors) {
            return (
                <MultipleAvatars
                    icons={[icon, secondaryAvatar]}
                    isInReportAction
                    shouldShowTooltip
                    secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(theme.appBG), isHovered ? StyleUtils.getBackgroundAndBorderStyle(theme.hoverComponentBG) : undefined]}
                />
            );
        }
        if (shouldShowSubscriptAvatar) {
            return (
                <SubscriptAvatar
                    mainAvatar={icon}
                    secondaryAvatar={secondaryAvatar}
                    noMargin
                />
            );
        }
        return (
            <UserDetailsTooltip
                accountID={Number(actorAccountID ?? 0)}
                delegateAccountID={Number(action?.delegateAccountID ?? 0)}
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
    const hasEmojiStatus = !displayAllActors && status?.emojiCode;
    const formattedDate = DateUtils.getStatusUntilDate(status?.clearAfter ?? '');
    const statusText = status?.text ?? '';
    const statusTooltipText = formattedDate ? `${statusText ? `${statusText} ` : ''}(${formattedDate})` : statusText;

    return (
        <View style={[styles.chatItem, wrapperStyle]}>
            <PressableWithoutFeedback
                style={[styles.alignSelfStart, styles.mr3]}
                onPressIn={ControlSelection.block}
                onPressOut={ControlSelection.unblock}
                onPress={showActorDetails}
                disabled={shouldDisableDetailPage}
                accessibilityLabel={actorHint}
                role={CONST.ROLE.BUTTON}
            >
                <OfflineWithFeedback pendingAction={pendingFields?.avatar ?? undefined}>{getAvatar()}</OfflineWithFeedback>
            </PressableWithoutFeedback>
            <View style={[styles.chatItemRight]}>
                {showHeader ? (
                    <View style={[styles.chatItemMessageHeader]}>
                        <PressableWithoutFeedback
                            style={[styles.flexShrink1, styles.mr1]}
                            onPressIn={ControlSelection.block}
                            onPressOut={ControlSelection.unblock}
                            onPress={showActorDetails}
                            disabled={shouldDisableDetailPage}
                            accessibilityLabel={actorHint}
                            role={CONST.ROLE.BUTTON}
                        >
                            {personArray?.map((fragment, index) => (
                                <ReportActionItemFragment
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`person-${action?.reportActionID}-${index}`}
                                    accountID={actorAccountID ?? 0}
                                    fragment={{...fragment, type: fragment.type ?? '', text: fragment.text ?? ''}}
                                    delegateAccountID={action?.delegateAccountID}
                                    isSingleLine
                                    actorIcon={icon}
                                    moderationDecision={action?.message?.[0].moderationDecision?.decision}
                                />
                            ))}
                        </PressableWithoutFeedback>
                        {Boolean(hasEmojiStatus) && (
                            <Tooltip text={statusTooltipText}>
                                <Text
                                    style={styles.userReportStatusEmoji}
                                    numberOfLines={1}
                                >{`${status?.emojiCode}`}</Text>
                            </Tooltip>
                        )}
                        <ReportActionItemDate created={action?.created ?? ''} />
                    </View>
                ) : null}
                <View style={hasBeenFlagged ? styles.blockquote : {}}>{children}</View>
            </View>
        </View>
    );
}

ReportActionItemSingle.displayName = 'ReportActionItemSingle';

export default ReportActionItemSingle;
