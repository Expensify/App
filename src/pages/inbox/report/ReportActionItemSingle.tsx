import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportActionAvatars from '@components/ReportActionAvatars';
import useReportActionAvatars from '@components/ReportActionAvatars/useReportActionAvatars';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDelegateAccountIDFromReportAction, getHumanAgentAccountIDFromReportAction, getManagerOnVacation, getModerationFlagState, getVacationer} from '@libs/ReportActionsUtils';
import {isOptimisticPersonalDetail} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import DelegateOnBehalfOfText from './DelegateOnBehalfOfText';
import HumanAgentAssistedByText from './HumanAgentAssistedByText';
import ReportActionItemDate from './ReportActionItemDate';
import ReportActionItemFragment from './ReportActionItemFragment';
import VacationDelegateText from './VacationDelegateText';

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

    /** If the action is being hovered */
    isHovered?: boolean;

    /** If the action is active */
    isActive?: boolean;
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
    report,
    iouReport: potentialIOUReport,
    isHovered = false,
    isActive = false,
}: ReportActionItemSingleProps) {
    const {latestDecision, hasBeenFlagged} = getModerationFlagState(action);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const {avatarType, avatars, details, source, reportPreviewSenderID} = useReportActionAvatars({report: potentialIOUReport ?? report, action});

    const reportID = source.chatReport?.reportID;
    const iouReportID = source.iouReport?.reportID;

    const [primaryAvatar, secondaryAvatar] = avatars;
    const delegateAccountID = getDelegateAccountIDFromReportAction(action);
    const humanAgentAccountID = getHumanAgentAccountIDFromReportAction(action);
    const mainAccountID = delegateAccountID ? (reportPreviewSenderID ?? potentialIOUReport?.ownerAccountID ?? action?.childOwnerAccountID) : undefined;
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const hasVacationDelegate = !!getVacationer(action) || !!getManagerOnVacation(action);

    const headingText = avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE ? `${primaryAvatar.name} & ${secondaryAvatar.name}` : primaryAvatar.name;

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

    const showActorDetails = () => {
        if (details.isWorkspaceActor) {
            showWorkspaceDetails(reportID);
        } else {
            // Show participants page IOU report preview
            if (iouReportID && details.shouldDisplayAllActors) {
                Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(iouReportID, Navigation.getReportRHPActiveRoute()));
                return;
            }
            showUserDetails(Number(primaryAvatar.id));
        }
    };

    const shouldDisableDetailPage =
        CONST.RESTRICTED_ACCOUNT_IDS.includes(details.accountID ?? CONST.DEFAULT_NUMBER_ID) ||
        (!details.isWorkspaceActor && isOptimisticPersonalDetail(action?.delegateAccountID ? Number(action.delegateAccountID) : (details.accountID ?? CONST.DEFAULT_NUMBER_ID)));

    const getBackgroundColor = () => {
        if (isActive) {
            return theme.messageHighlightBG;
        }
        if (isHovered) {
            return theme.hoverComponentBG;
        }
        return theme.sidebar;
    };

    const currentSelectedTimezone = currentUserPersonalDetails?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected;
    const hasEmojiStatus = !details.shouldDisplayAllActors && details.status?.emojiCode;
    const formattedDate = DateUtils.getStatusUntilDate(translate, details.status?.clearAfter ?? '', details.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected, currentSelectedTimezone);
    const statusText = details.status?.text ?? '';
    const statusTooltipText = formattedDate ? `${statusText ? `${statusText} ` : ''}(${formattedDate})` : statusText;

    return (
        <View style={[styles.chatItem, wrapperStyle]}>
            <PressableWithoutFeedback
                style={[styles.alignSelfStart, styles.mr3]}
                onPressIn={ControlSelection.block}
                onPressOut={ControlSelection.unblock}
                onPress={showActorDetails}
                disabled={shouldDisableDetailPage}
                accessibilityLabel={details.actorHint}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_SINGLE_AVATAR_BUTTON}
            >
                <OfflineWithFeedback pendingAction={details.pendingFields?.avatar ?? undefined}>
                    <ReportActionAvatars
                        singleAvatarContainerStyle={[styles.actionAvatar]}
                        subscriptAvatarBorderColor={getBackgroundColor()}
                        noRightMarginOnSubscriptContainer
                        isInReportAction
                        shouldShowTooltip
                        secondaryAvatarContainerStyle={[
                            StyleUtils.getBackgroundAndBorderStyle(theme.appBG),
                            isHovered ? StyleUtils.getBackgroundAndBorderStyle(theme.hoverComponentBG) : undefined,
                        ]}
                        reportID={iouReportID}
                        chatReportID={source.iouReport?.chatReportID ?? reportID}
                        action={action}
                    />
                </OfflineWithFeedback>
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
                            accessibilityLabel={details.actorHint}
                            role={CONST.ROLE.BUTTON}
                            sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_SINGLE_ACTOR_BUTTON}
                        >
                            {personArray?.map((fragment, index) => (
                                <ReportActionItemFragment
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`person-${action?.reportActionID}-${index}`}
                                    accountID={Number(details.delegateAccountID ?? primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                                    fragment={{...fragment, type: fragment.type ?? '', text: fragment.text ?? ''}}
                                    delegateAccountID={action?.delegateAccountID}
                                    isSingleLine
                                    actorIcon={primaryAvatar}
                                    moderationDecision={latestDecision}
                                    shouldShowTooltip={avatarType !== CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE}
                                />
                            ))}
                        </PressableWithoutFeedback>
                        {!!hasEmojiStatus && (
                            <Tooltip text={statusTooltipText}>
                                <Text
                                    style={styles.userReportStatusEmoji}
                                    numberOfLines={1}
                                >{`${details.status?.emojiCode}`}</Text>
                            </Tooltip>
                        )}
                        <ReportActionItemDate created={action?.created ?? ''} />
                    </View>
                ) : null}
                {!!delegateAccountID && (
                    <DelegateOnBehalfOfText
                        mainAccountID={mainAccountID}
                        fallbackLogin={details.login}
                    />
                )}
                {!!humanAgentAccountID && <HumanAgentAssistedByText action={action} />}
                {hasVacationDelegate && <VacationDelegateText action={action} />}
                <View style={hasBeenFlagged ? styles.blockquote : {}}>{children}</View>
            </View>
        </View>
    );
}

export default ReportActionItemSingle;
