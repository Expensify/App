import React, {useCallback, useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import SubscriptAvatar from '@components/SubscriptAvatar';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getReportActionMessage} from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    report: OnyxEntry<Report>;

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
    Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getReportRHPActiveRoute()));
};

const showWorkspaceDetails = (reportID: string) => {
    Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, Navigation.getReportRHPActiveRoute()));
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
    const policy = usePolicy(report?.policyID);
    const delegatePersonalDetails = personalDetails[action?.delegateAccountID ?? ''];
    const actorAccountID = ReportUtils.getReportActionActorAccountID(action);
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.invoiceReceiver && 'policyID' in report.invoiceReceiver ? report.invoiceReceiver.policyID : -1}`);
    let displayName = ReportUtils.getDisplayNameForParticipant(actorAccountID);
    const icons = ReportUtils.getIcons(iouReport ?? null, personalDetails);
    const {avatar, login, pendingFields, status, fallbackIcon} = personalDetails[actorAccountID ?? -1] ?? {};
    const accountOwnerDetails = getPersonalDetailByEmail(login ?? '');
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    let actorHint = (login || (displayName ?? '')).replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, '');
    const isTripRoom = ReportUtils.isTripRoom(report);
    const isReportPreviewAction = action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
    const displayAllActors = isReportPreviewAction && !isTripRoom && ReportUtils.isIOUReport(iouReport ?? null) && icons.length > 1;
    const isInvoiceReport = ReportUtils.isInvoiceReport(iouReport ?? null);
    const isWorkspaceActor = isInvoiceReport || (ReportUtils.isPolicyExpenseChat(report) && (!actorAccountID || displayAllActors));
    const ownerAccountID = iouReport?.ownerAccountID ?? action?.childOwnerAccountID;
    const managerID = iouReport?.managerID ?? action?.childManagerAccountID;
    let avatarSource = avatar;
    let avatarId: number | string | undefined = actorAccountID;

    if (isWorkspaceActor) {
        displayName = ReportUtils.getPolicyName(report, undefined, policy);
        actorHint = displayName;
        avatarSource = ReportUtils.getWorkspaceIcon(report, policy).source;
        avatarId = report?.policyID;
    } else if (action?.delegateAccountID && personalDetails[action?.delegateAccountID]) {
        displayName = delegatePersonalDetails?.displayName ?? '';
        avatarSource = delegatePersonalDetails?.avatar;
        avatarId = delegatePersonalDetails?.accountID;
    } else if (isReportPreviewAction && isTripRoom) {
        displayName = report?.reportName ?? '';
    }

    // If this is a report preview, display names and avatars of both people involved
    let secondaryAvatar: Icon;
    const primaryDisplayName = displayName;
    if (displayAllActors) {
        if (ReportUtils.isInvoiceRoom(report) && !ReportUtils.isIndividualInvoiceRoom(report)) {
            const secondaryPolicyAvatar = invoiceReceiverPolicy?.avatarURL ?? ReportUtils.getDefaultWorkspaceAvatar(invoiceReceiverPolicy?.name);

            secondaryAvatar = {
                source: secondaryPolicyAvatar,
                type: CONST.ICON_TYPE_WORKSPACE,
                name: invoiceReceiverPolicy?.name,
                id: invoiceReceiverPolicy?.id,
            };
        } else {
            // The ownerAccountID and actorAccountID can be the same if a user submits an expense back from the IOU's original creator, in that case we need to use managerID to avoid displaying the same user twice
            const secondaryAccountId = ownerAccountID === actorAccountID || isInvoiceReport ? managerID : ownerAccountID;
            const secondaryUserAvatar = personalDetails?.[secondaryAccountId ?? -1]?.avatar ?? FallbackAvatar;
            const secondaryDisplayName = ReportUtils.getDisplayNameForParticipant(secondaryAccountId);
            secondaryAvatar = {
                source: secondaryUserAvatar,
                type: CONST.ICON_TYPE_AVATAR,
                name: secondaryDisplayName ?? '',
                id: secondaryAccountId,
            };
        }
    } else if (!isWorkspaceActor) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const avatarIconIndex = report?.isOwnPolicyExpenseChat || ReportUtils.isPolicyExpenseChat(report) ? 0 : 1;
        const reportIcons = ReportUtils.getIcons(report, {});

        secondaryAvatar = reportIcons.at(avatarIconIndex) ?? {name: '', source: '', type: 'avatar'};
    } else {
        secondaryAvatar = {name: '', source: '', type: 'avatar'};
    }

    const icon = useMemo(
        () => ({
            source: avatarSource ?? FallbackAvatar,
            type: isWorkspaceActor ? CONST.ICON_TYPE_WORKSPACE : CONST.ICON_TYPE_AVATAR,
            name: primaryDisplayName ?? '',
            id: avatarId,
        }),
        [avatarSource, isWorkspaceActor, primaryDisplayName, avatarId],
    );

    // Since the display name for a report action message is delivered with the report history as an array of fragments
    // we'll need to take the displayName from personal details and have it be in the same format for now. Eventually,
    // we should stop referring to the report history items entirely for this information.
    const personArray = useMemo(() => {
        const baseArray = displayName
            ? [
                  {
                      type: 'TEXT',
                      text: displayName,
                  },
              ]
            : action?.person ?? [];

        if (displayAllActors) {
            return [
                ...baseArray,
                {
                    type: 'TEXT',
                    text: secondaryAvatar.name ?? '',
                },
            ];
        }
        return baseArray;
    }, [displayName, action?.person, displayAllActors, secondaryAvatar?.name]);

    const reportID = report?.reportID;
    const iouReportID = iouReport?.reportID;

    const showActorDetails = useCallback(() => {
        if (isWorkspaceActor) {
            showWorkspaceDetails(reportID ?? '');
        } else {
            // Show participants page IOU report preview
            if (iouReportID && displayAllActors) {
                Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(iouReportID, Navigation.getReportRHPActiveRoute()));
                return;
            }
            showUserDetails(action?.delegateAccountID ? String(action.delegateAccountID) : String(actorAccountID));
        }
    }, [isWorkspaceActor, reportID, actorAccountID, action?.delegateAccountID, iouReportID, displayAllActors]);

    const shouldDisableDetailPage = useMemo(
        () =>
            CONST.RESTRICTED_ACCOUNT_IDS.includes(actorAccountID ?? -1) ||
            (!isWorkspaceActor && ReportUtils.isOptimisticPersonalDetail(action?.delegateAccountID ? Number(action.delegateAccountID) : actorAccountID ?? -1)),
        [action, isWorkspaceActor, actorAccountID],
    );

    const getAvatar = useMemo(() => {
        return () => {
            if (displayAllActors) {
                return (
                    <MultipleAvatars
                        icons={icons}
                        isInReportAction
                        shouldShowTooltip
                        secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(theme.appBG), isHovered ? StyleUtils.getBackgroundAndBorderStyle(theme.hoverComponentBG) : undefined]}
                    />
                );
            }
            if (shouldShowSubscriptAvatar) {
                return (
                    <SubscriptAvatar
                        mainAvatar={icons.at(0)}
                        secondaryAvatar={icons.at(1) ?? secondaryAvatar}
                        noMargin
                        backgroundColor={isHovered ? theme.hoverComponentBG : theme.componentBG}
                    />
                );
            }
            return (
                <UserDetailsTooltip
                    accountID={Number(actorAccountID ?? -1)}
                    delegateAccountID={Number(action?.delegateAccountID ?? -1)}
                    icon={icon}
                >
                    <View>
                        <Avatar
                            containerStyles={[styles.actionAvatar]}
                            source={icon.source}
                            type={icon.type}
                            name={icon.name}
                            avatarID={icon.id}
                            fallbackIcon={fallbackIcon}
                        />
                    </View>
                </UserDetailsTooltip>
            );
        };
    }, [
        displayAllActors,
        shouldShowSubscriptAvatar,
        actorAccountID,
        action?.delegateAccountID,
        icon,
        styles.actionAvatar,
        fallbackIcon,
        icons,
        StyleUtils,
        theme.appBG,
        theme.hoverComponentBG,
        theme.componentBG,
        isHovered,
        secondaryAvatar,
    ]);

    const getHeading = useMemo(() => {
        return () => {
            if (displayAllActors && secondaryAvatar.name && isReportPreviewAction) {
                return (
                    <View style={[styles.flexRow]}>
                        <ReportActionItemFragment
                            style={[styles.flex1]}
                            key={`person-${action?.reportActionID}-${0}`}
                            accountID={actorAccountID ?? -1}
                            fragment={{...personArray[0], type: 'TEXT', text: displayName ?? ''}}
                            delegateAccountID={action?.delegateAccountID}
                            isSingleLine
                            actorIcon={icon}
                            moderationDecision={getReportActionMessage(action)?.moderationDecision?.decision}
                        />
                        <Text
                            numberOfLines={1}
                            style={[styles.chatItemMessageHeaderSender, styles.pre]}
                        >
                            {` & `}
                        </Text>
                        <ReportActionItemFragment
                            style={[styles.flex1]}
                            key={`person-${action?.reportActionID}-${1}`}
                            accountID={parseInt(`${secondaryAvatar?.id ?? -1}`, 10)}
                            fragment={{...personArray[1], type: 'TEXT', text: secondaryAvatar.name ?? ''}}
                            delegateAccountID={action?.delegateAccountID}
                            isSingleLine
                            actorIcon={secondaryAvatar}
                            moderationDecision={getReportActionMessage(action)?.moderationDecision?.decision}
                        />
                    </View>
                );
            }
            return (
                <View>
                    {personArray?.map((fragment) => (
                        <ReportActionItemFragment
                            style={[styles.flex1]}
                            key={`person-${action?.reportActionID}-${actorAccountID}`}
                            accountID={actorAccountID ?? -1}
                            fragment={{...fragment, type: fragment.type ?? '', text: fragment.text ?? ''}}
                            delegateAccountID={action?.delegateAccountID}
                            isSingleLine
                            actorIcon={icon}
                            moderationDecision={getReportActionMessage(action)?.moderationDecision?.decision}
                        />
                    ))}
                </View>
            );
        };
    }, [
        displayAllActors,
        secondaryAvatar,
        isReportPreviewAction,
        personArray,
        styles.flexRow,
        styles.flex1,
        styles.chatItemMessageHeaderSender,
        styles.pre,
        action,
        actorAccountID,
        displayName,
        icon,
    ]);

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
                            {getHeading()}
                        </PressableWithoutFeedback>
                        {!!hasEmojiStatus && (
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
                {action?.delegateAccountID && !isReportPreviewAction && (
                    <Text style={[styles.chatDelegateMessage]}>{translate('delegate.onBehalfOfMessage', {delegator: accountOwnerDetails?.displayName ?? ''})}</Text>
                )}
                <View style={hasBeenFlagged ? styles.blockquote : {}}>{children}</View>
            </View>
        </View>
    );
}
ReportActionItemSingle.displayName = 'ReportActionItemSingle';
export default ReportActionItemSingle;
