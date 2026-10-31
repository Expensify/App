import useActionAvatar from '@components/Avatar/connected/useActionAvatar';
import DiagonalAvatars from '@components/Avatar/layouts/DiagonalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import ControlSelection from '@libs/ControlSelection';
import DateUtils from '@libs/DateUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getDelegateAccountIDFromReportAction, getHumanAgentAccountIDFromReportAction, getManagerOnVacation, getModerationFlagState, getVacationer} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {isPersonalDetailOptimistic} from '@selectors/PersonalDetails';
import React from 'react';
import {View} from 'react-native';

import DelegateOnBehalfOfText from './DelegateOnBehalfOfText';
import HumanAgentAssistedByText from './HumanAgentAssistedByText';
import ReportActionItemDate from './ReportActionItemDate';
import ReportActionItemFragment from './ReportActionItemFragment';
import VacationDelegateText from './VacationDelegateText';

type ReportActionItemSingleProps = Partial<ChildrenProps> & {
    action: OnyxEntry<ReportAction>;

    /** Styles for the outermost View */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Report for this action */
    report: OnyxEntry<Report>;

    /** IOU Report for this action, if any */
    iouReport?: OnyxEntry<Report>;

    showHeader?: boolean;
    isHovered?: boolean;
    isActive?: boolean;
};

const showUserDetails = (accountID: number | undefined) => {
    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(accountID)));
};

const showWorkspaceDetails = (reportID: string | undefined) => {
    if (!reportID) {
        return;
    }
    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_DETAILS.path));
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
    const {translate, dateFnsLocale} = useLocalize();
    const isOnSearch = useIsOnSearch();

    const {
        avatarType,
        layout,
        primaryAvatar,
        secondaryAvatar,
        accountID,
        actorPersonalDetails,
        actedForAccountID,
        isWorkspaceActor,
        shouldDisplayAllActors,
        actorHint,
        reportPreviewSenderID,
        chatReportID,
        iouReportID,
    } = useActionAvatar({action, report: potentialIOUReport ?? report, shouldUseRealActor: isOnSearch});
    const delegateAccountID = getDelegateAccountIDFromReportAction(action);
    const humanAgentAccountID = getHumanAgentAccountIDFromReportAction(action);
    const mainAccountID = delegateAccountID ? (reportPreviewSenderID ?? potentialIOUReport?.ownerAccountID ?? action?.childOwnerAccountID) : undefined;
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const hasVacationDelegate = !!getVacationer(action) || !!getManagerOnVacation(action);

    const headingText = avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE ? `${primaryAvatar.name} & ${secondaryAvatar?.name ?? ''}` : primaryAvatar.name;

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
        if (isWorkspaceActor) {
            showWorkspaceDetails(chatReportID);
        } else {
            // Show participants page IOU report preview
            if (iouReportID && shouldDisplayAllActors) {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_PARTICIPANTS.path));
                return;
            }
            showUserDetails(Number(primaryAvatar.id));
        }
    };

    const optimisticCheckAccountID = delegateAccountID ? Number(delegateAccountID) : accountID;
    const [isOptimistic] = usePersonalDetail(optimisticCheckAccountID, isPersonalDetailOptimistic);
    const shouldDisableDetailPage = CONST.RESTRICTED_ACCOUNT_IDS.includes(accountID) || (!isWorkspaceActor && !!isOptimistic);

    const getBackgroundColor = () => {
        if (isActive) {
            return theme.messageHighlightBG;
        }
        if (isHovered) {
            return theme.hoverComponentBG;
        }
        return theme.sidebar;
    };

    let avatarElement = (
        <SingleAvatar
            avatar={primaryAvatar}
            size={CONST.AVATAR_SIZE.DEFAULT}
            containerStyles={styles.actionAvatar}
        />
    );
    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT) {
        avatarElement = (
            <SubscriptAvatar
                primaryAvatar={primaryAvatar}
                secondaryAvatar={secondaryAvatar}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={styles.mr0}
                backdropColor={getBackgroundColor()}
            />
        );
    } else if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL && secondaryAvatar) {
        avatarElement = (
            <DiagonalAvatars
                size={CONST.AVATAR_SIZE.DEFAULT}
                icons={[primaryAvatar, secondaryAvatar]}
                isInReportAction
                backdropColor={getBackgroundColor()}
            />
        );
    }

    const currentSelectedTimezone = currentUserPersonalDetails?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected;
    const hasEmojiStatus = !shouldDisplayAllActors && actorPersonalDetails?.status?.emojiCode;
    const formattedDate = DateUtils.getStatusUntilDate(
        translate,
        dateFnsLocale,
        actorPersonalDetails?.status?.clearAfter ?? '',
        actorPersonalDetails?.timezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected,
        currentSelectedTimezone,
    );
    const statusText = actorPersonalDetails?.status?.text ?? '';
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
                sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_SINGLE_AVATAR_BUTTON}
            >
                <OfflineWithFeedback pendingAction={actorPersonalDetails?.pendingFields?.avatar ?? undefined}>{avatarElement}</OfflineWithFeedback>
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
                            sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_SINGLE_ACTOR_BUTTON}
                        >
                            {personArray?.map((fragment, index) => (
                                <ReportActionItemFragment
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`person-${action?.reportActionID}-${index}`}
                                    accountID={Number(actedForAccountID ?? primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                                    fragment={{...fragment, type: fragment.type ?? '', text: fragment.text ?? ''}}
                                    delegateAccountID={delegateAccountID}
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
                                >{`${actorPersonalDetails?.status?.emojiCode}`}</Text>
                            </Tooltip>
                        )}
                        <ReportActionItemDate created={action?.created ?? ''} />
                    </View>
                ) : null}
                {!!delegateAccountID && (
                    <DelegateOnBehalfOfText
                        mainAccountID={mainAccountID}
                        fallbackLogin={actorPersonalDetails?.login}
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
