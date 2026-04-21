import React from 'react';
import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InvitedEmailsToAccountIDs, Policy, Report, ReportAction} from '@src/types/onyx';
import type {CardFeed} from '@src/types/onyx/CardFeeds';
import IconsAvatar from './IconsAvatar';
import type {HorizontalStacking} from './ReportActionAvatar';
import useReportActionAvatars from './useReportActionAvatars';

type ReportActionAvatarsProps = {
    horizontalStacking?: HorizontalStacking | boolean;

    /** Report ID for the report action avatars */
    reportID?: string;

    /** Report data for the report action avatars. When provided, this will be used as a fallback if the snapshot is undefined */
    report?: OnyxEntry<Report>;

    /** Action for the report action avatars */
    action?: OnyxEntry<ReportAction>;

    /** Policy ID for the workspace avatar */
    policyID?: string;

    /** Policy data for the workspace avatar. When provided, this will be used as a fallback if the snapshot is undefined */
    policy?: OnyxEntry<Policy>;

    /** Single avatar container styles */
    singleAvatarContainerStyle?: ViewStyle[];

    /** Account IDs to display avatars for, it overrides the reportID and action props */
    accountIDs?: number[];

    /** Set the size of avatars */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Style for Second Avatar */
    secondaryAvatarContainerStyle?: StyleProp<ViewStyle>;

    /** Whether #focus mode is on */
    useMidSubscriptSizeForMultipleAvatars?: boolean;

    /** Whether avatars are displayed within a reportAction */
    isInReportAction?: boolean;

    /** Whether to show the tooltip text */
    shouldShowTooltip?: boolean;

    /** Whether to show the subscript avatar without margin */
    noRightMarginOnSubscriptContainer?: boolean;

    /** Border color for the subscript avatar */
    subscriptAvatarBorderColor?: ColorValue;

    /** Subscript card feed to display instead of the second avatar */
    subscriptCardFeed?: CardFeed;

    /** Whether we want to be redirected to profile on avatars click */
    useProfileNavigationWrapper?: boolean;

    /** Display name used as a fallback for avatar tooltip */
    fallbackDisplayName?: string;

    /** Invited emails to account IDs */
    invitedEmailsToAccountIDs?: InvitedEmailsToAccountIDs;

    /** Whether to use custom fallback avatar */
    shouldUseCustomFallbackAvatar?: boolean;

    /** chatReportID needed for the avatars logic. When provided, this will be used as a fallback if the snapshot is undefined */
    chatReportID?: string;
};

/**
 * Heavy avatar component that resolves report/action/policy data via Onyx
 * and delegates rendering to IconsAvatar.
 *
 * Renders proper user avatars based on either:
 * - policyID - workspace avatar
 * - accountIDs - prioritized over report/action
 * - action - chat threads, messages, report/trip previews
 * - reportID - chat report avatars, DM chat avatars
 */
function ReportActionAvatars({
    reportID: potentialReportID,
    report: reportProp,
    action,
    accountIDs: passedAccountIDs = [],
    policyID,
    policy: policyProp,
    size = CONST.AVATAR_SIZE.DEFAULT,
    shouldShowTooltip = true,
    horizontalStacking,
    singleAvatarContainerStyle,
    subscriptAvatarBorderColor,
    noRightMarginOnSubscriptContainer = false,
    subscriptCardFeed,
    secondaryAvatarContainerStyle,
    useMidSubscriptSizeForMultipleAvatars = false,
    isInReportAction = false,
    useProfileNavigationWrapper,
    fallbackDisplayName,
    invitedEmailsToAccountIDs,
    shouldUseCustomFallbackAvatar = false,
    chatReportID,
}: ReportActionAvatarsProps) {
    const accountIDs = passedAccountIDs.filter((accountID) => accountID !== CONST.DEFAULT_NUMBER_ID);

    const reportID =
        potentialReportID ??
        ([CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW].find((act) => act === action?.actionName) ? action?.childReportID : undefined);

    // reportID can be an empty string causing Onyx to fetch the whole collection
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [reportFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID || undefined}`);
    const report = reportFromOnyx ?? reportProp;

    const shouldStackHorizontally = !!horizontalStacking;

    const {
        avatarType,
        avatars: icons,
        details: {delegateAccountID},
        source,
    } = useReportActionAvatars({
        report,
        action,
        shouldStackHorizontally,
        shouldUseCardFeed: !!subscriptCardFeed,
        accountIDs,
        policyID,
        policy: policyProp,
        fallbackDisplayName,
        invitedEmailsToAccountIDs,
        shouldUseCustomFallbackAvatar,
        chatReportID,
    });

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE && !icons.length) {
        return null;
    }

    return (
        <IconsAvatar
            icons={icons}
            avatarType={avatarType}
            horizontalStacking={horizontalStacking}
            subscriptCardFeed={subscriptCardFeed}
            size={size}
            shouldShowTooltip={shouldShowTooltip}
            isInReportAction={isInReportAction}
            fallbackDisplayName={fallbackDisplayName}
            useProfileNavigationWrapper={useProfileNavigationWrapper}
            reportID={reportID}
            singleAvatarContainerStyle={singleAvatarContainerStyle}
            delegateTooltipAccountID={delegateAccountID ? Number(delegateAccountID) : undefined}
            delegateAccountID={source.action?.delegateAccountID}
            subscriptAvatarBorderColor={subscriptAvatarBorderColor}
            noRightMarginOnSubscriptContainer={noRightMarginOnSubscriptContainer}
            secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
            useMidSubscriptSize={useMidSubscriptSizeForMultipleAvatars}
        />
    );
}

export default ReportActionAvatars;
