import React from 'react';
import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeed, InvitedEmailsToAccountIDs, Policy, Report, ReportAction} from '@src/types/onyx';
import type {HorizontalStacking} from './ReportActionAvatar';
import ReportActionAvatar from './ReportActionAvatar';
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
    subscriptCardFeed?: CompanyCardFeed | typeof CONST.EXPENSIFY_CARD.BANK;

    /** Whether we want to be redirected to profile on avatars click */
    useProfileNavigationWrapper?: boolean;

    /** Display name used as a fallback for avatar tooltip */
    fallbackDisplayName?: string;

    /** Invited emails to account IDs */
    invitedEmailsToAccountIDs?: InvitedEmailsToAccountIDs;

    /** Whether to use custom fallback avatar */
    shouldUseCustomFallbackAvatar?: boolean;
};

/**
 * The component that renders proper user avatars based on either:
 *
 * - policyID - this can be passed if we have no other option, and we want to display workspace avatar, it makes component ignore the props below
 * - accountIDs - if this is passed, it is prioritized and render even if report or action has different avatars attached, useful for option items, menu items etc.
 * - action - this is useful when we want to display avatars of chat threads, messages, report/trip previews etc.
 * - reportID - this can be passed without above props, when we want to display chat report avatars, DM chat avatars etc.
 *
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
}: ReportActionAvatarsProps) {
    const accountIDs = passedAccountIDs.filter((accountID) => accountID !== CONST.DEFAULT_NUMBER_ID);

    const reportID =
        potentialReportID ??
        ([CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW].find((act) => act === action?.actionName) ? action?.childReportID : undefined);

    // reportID can be an empty string causing Onyx to fetch the whole collection
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [reportFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID || undefined}`, {canBeMissing: true});
    // When the search hash changes, report from the snapshot will be undefined if it hasn't been fetched yet.
    // Therefore, we will fall back to reportProp while the data is being fetched.
    const report = reportFromOnyx ?? reportProp;

    const shouldStackHorizontally = !!horizontalStacking;
    const isHorizontalStackingAnObject = shouldStackHorizontally && typeof horizontalStacking !== 'boolean';
    const {isHovered = false} = isHorizontalStackingAnObject ? horizontalStacking : {};

    const {
        avatarType: notPreciseAvatarType,
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
    });

    let avatarType: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE> = notPreciseAvatarType;

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE && !icons.length) {
        return null;
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE) {
        avatarType = shouldStackHorizontally ? CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL : CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL;
    }

    const [primaryAvatar, secondaryAvatar] = icons;

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT && (!!secondaryAvatar?.name || !!subscriptCardFeed)) {
        return (
            <ReportActionAvatar.Subscript
                primaryAvatar={primaryAvatar}
                secondaryAvatar={secondaryAvatar}
                size={size}
                shouldShowTooltip={shouldShowTooltip}
                noRightMarginOnContainer={noRightMarginOnSubscriptContainer}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor}
                subscriptCardFeed={subscriptCardFeed}
                useProfileNavigationWrapper={useProfileNavigationWrapper}
                fallbackDisplayName={fallbackDisplayName}
                reportID={reportID}
            />
        );
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL) {
        return (
            <ReportActionAvatar.Multiple.Horizontal
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...(isHorizontalStackingAnObject ? horizontalStacking : {})}
                size={size}
                icons={icons}
                isInReportAction={isInReportAction}
                shouldShowTooltip={shouldShowTooltip}
                useProfileNavigationWrapper={useProfileNavigationWrapper}
                fallbackDisplayName={fallbackDisplayName}
                reportID={reportID}
            />
        );
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL && !!secondaryAvatar?.name) {
        return (
            <ReportActionAvatar.Multiple.Diagonal
                shouldShowTooltip={shouldShowTooltip}
                size={size}
                icons={icons}
                isInReportAction={isInReportAction}
                useMidSubscriptSize={useMidSubscriptSizeForMultipleAvatars}
                secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
                isHovered={isHovered}
                fallbackDisplayName={fallbackDisplayName}
                useProfileNavigationWrapper={useProfileNavigationWrapper}
                reportID={reportID}
            />
        );
    }

    return (
        <ReportActionAvatar.Single
            avatar={primaryAvatar}
            size={size}
            containerStyles={shouldStackHorizontally ? [] : singleAvatarContainerStyle}
            shouldShowTooltip={shouldShowTooltip}
            accountID={Number(delegateAccountID ?? primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
            delegateAccountID={source.action?.delegateAccountID}
            fallbackIcon={primaryAvatar.fallbackIcon}
            fallbackDisplayName={fallbackDisplayName}
            useProfileNavigationWrapper={useProfileNavigationWrapper}
            reportID={reportID}
        />
    );
}

export default ReportActionAvatars;
