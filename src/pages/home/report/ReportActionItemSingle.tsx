import React, {useCallback, useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import SingleReportAvatar from '@components/ReportActionItem/SingleReportAvatar';
import SubscriptAvatar from '@components/SubscriptAvatar';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportAvatarDetails from '@hooks/useReportAvatarDetails';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getReportActionMessage} from '@libs/ReportActionsUtils';
import {getReportActionActorAccountID, isOptimisticPersonalDetail} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
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

    /** If the action is active */
    isActive?: boolean;

    /** Policies */
    policies?: OnyxCollection<Policy>;
};

const showUserDetails = (accountID: number | undefined) => {
    Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getActiveRoute()));
};

const showWorkspaceDetails = (reportID: string | undefined) => {
    if (!reportID) {
        return;
    }
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
    isActive = false,
    policies,
}: ReportActionItemSingleProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
    });

    const [innerPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: true,
    });

    const policy = usePolicy(report?.policyID);

    const delegatePersonalDetails = action?.delegateAccountID ? personalDetails?.[action?.delegateAccountID] : undefined;
    const actorAccountID = getReportActionActorAccountID(action, iouReport, report, delegatePersonalDetails);

    const reportPreviewDetails = useReportAvatarDetails({
        action,
        report,
        iouReport,
        policies,
        personalDetails,
        innerPolicies,
        policy,
        formatPhoneNumber,
    });

    const {primaryAvatar, secondaryAvatar, displayName, shouldDisplayAllActors, isWorkspaceActor, reportPreviewSenderID, actorHint} = reportPreviewDetails;
    const accountID = reportPreviewSenderID ?? actorAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const {login, pendingFields, status} = personalDetails?.[accountID] ?? {};
    const accountOwnerDetails = getPersonalDetailByEmail(login ?? '');

    const showMultipleUserAvatarPattern = shouldDisplayAllActors && !shouldShowSubscriptAvatar;
    const headingText = showMultipleUserAvatarPattern ? `${primaryAvatar.name} & ${secondaryAvatar.name}` : displayName;

    // Since the display name for a report action message is delivered with the report history as an array of fragments
    // we'll need to take the displayName from personal details and have it be in the same format for now. Eventually,
    // we should stop referring to the report history items entirely for this information.
    const personArray = headingText
        ? [
              {
                  type: 'TEXT',
                  text: headingText,
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
            if (iouReportID && shouldDisplayAllActors) {
                Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(iouReportID, Navigation.getReportRHPActiveRoute()));
                return;
            }
            showUserDetails(Number(primaryAvatar.id));
        }
    }, [isWorkspaceActor, reportID, iouReportID, shouldDisplayAllActors, primaryAvatar.id]);

    const shouldDisableDetailPage = useMemo(
        () =>
            CONST.RESTRICTED_ACCOUNT_IDS.includes(actorAccountID ?? CONST.DEFAULT_NUMBER_ID) ||
            (!isWorkspaceActor && isOptimisticPersonalDetail(action?.delegateAccountID ? Number(action.delegateAccountID) : (actorAccountID ?? CONST.DEFAULT_NUMBER_ID))),
        [action, isWorkspaceActor, actorAccountID],
    );

    const getBackgroundColor = () => {
        if (isActive) {
            return theme.messageHighlightBG;
        }
        if (isHovered) {
            return theme.hoverComponentBG;
        }
        return theme.sidebar;
    };

    const getAvatar = () => {
        if (shouldShowSubscriptAvatar) {
            return (
                <SubscriptAvatar
                    mainAvatar={primaryAvatar}
                    secondaryAvatar={secondaryAvatar}
                    noMargin
                    backgroundColor={getBackgroundColor()}
                />
            );
        }
        if (shouldDisplayAllActors) {
            return (
                <MultipleAvatars
                    icons={[primaryAvatar, secondaryAvatar]}
                    isInReportAction
                    shouldShowTooltip
                    secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(theme.appBG), isHovered ? StyleUtils.getBackgroundAndBorderStyle(theme.hoverComponentBG) : undefined]}
                />
            );
        }

        return (
            <SingleReportAvatar
                reportPreviewDetails={reportPreviewDetails}
                personalDetails={personalDetails}
                containerStyles={[styles.actionAvatar]}
                actorAccountID={actorAccountID}
            />
        );
    };

    const hasEmojiStatus = !shouldDisplayAllActors && status?.emojiCode;
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
                                    accountID={Number(delegatePersonalDetails && !isWorkspaceActor ? actorAccountID : (primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID))}
                                    fragment={{...fragment, type: fragment.type ?? '', text: fragment.text ?? ''}}
                                    delegateAccountID={action?.delegateAccountID}
                                    isSingleLine
                                    actorIcon={primaryAvatar}
                                    moderationDecision={getReportActionMessage(action)?.moderationDecision?.decision}
                                    shouldShowTooltip={!showMultipleUserAvatarPattern}
                                />
                            ))}
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
                {!!action?.delegateAccountID && (
                    <Text style={[styles.chatDelegateMessage]}>{translate('delegate.onBehalfOfMessage', {delegator: accountOwnerDetails?.displayName ?? ''})}</Text>
                )}
                <View style={hasBeenFlagged ? styles.blockquote : {}}>{children}</View>
            </View>
        </View>
    );
}

ReportActionItemSingle.displayName = 'ReportActionItemSingle';

export default ReportActionItemSingle;
