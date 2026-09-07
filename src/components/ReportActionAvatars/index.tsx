import DiagonalAvatars from '@components/Avatar/layouts/DiagonalAvatars';
import getAvatarLayout from '@components/Avatar/layouts/getAvatarLayout';
import HorizontalAvatars from '@components/Avatar/layouts/HorizontalAvatars';
import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import SubscriptCardFeedAvatar from '@components/Avatar/layouts/SubscriptCardFeedAvatar';
import type {AvatarIcon} from '@components/Avatar/types';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {sortIconsByName} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InvitedEmailsToAccountIDs, Policy, Report, ReportAction} from '@src/types/onyx';
import type {CardFeed} from '@src/types/onyx/CardFeeds';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import lodashSortBy from 'lodash/sortBy';
import React from 'react';

import useReportActionAvatars from './useReportActionAvatars';

type SortingOptions = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type ReportActionAvatarsProps = {
    horizontalStacking?: HorizontalStackingOptions | boolean;

    /** How to order the avatars before rendering them. Only applies to a horizontal stack, where every avatar sits in an equivalent slot */
    sort?: SortingOptions | SortingOptions[];

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
    singleAvatarContainerStyle?: StyleProp<ViewStyle>;

    /** Account IDs to display avatars for, it overrides the reportID and action props */
    accountIDs?: number[];

    /** Set the size of avatars */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Style for Second Avatar */
    secondaryAvatarContainerStyle?: StyleProp<ViewStyle>;

    /** Whether avatars are displayed within a reportAction */
    isInReportAction?: boolean;

    /** Whether to show the subscript avatar without margin */
    noRightMarginOnSubscriptContainer?: boolean;

    /** Border color for the subscript avatar */
    subscriptAvatarBorderColor?: ColorValue;

    /** Subscript card feed to display instead of the second avatar */
    subscriptCardFeed?: CardFeed;

    /** Size of the subscript card feed icon */
    subscriptCardFeedIconSize?: {width: number; height: number};

    /** Display name used as a fallback for avatar tooltip */
    fallbackDisplayName?: string;

    /** Invited emails to account IDs. Also seeds a deterministic fallback avatar for each invited account */
    invitedEmailsToAccountIDs?: InvitedEmailsToAccountIDs;

    /** chatReportID needed for the avatars logic. When provided, this will be used as a fallback if the snapshot is undefined */
    chatReportID?: string;

    /** Whether to show the real actor instead of Concierge for automatic actions (e.g. in search results) */
    shouldUseRealActor?: boolean;
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
    horizontalStacking,
    sort: sortAvatars,
    singleAvatarContainerStyle,
    subscriptAvatarBorderColor,
    noRightMarginOnSubscriptContainer = false,
    subscriptCardFeed,
    subscriptCardFeedIconSize,
    secondaryAvatarContainerStyle,
    isInReportAction = false,
    fallbackDisplayName,
    invitedEmailsToAccountIDs,
    chatReportID,
    shouldUseRealActor = false,
}: ReportActionAvatarsProps) {
    const accountIDs = passedAccountIDs.filter((accountID) => accountID !== CONST.DEFAULT_NUMBER_ID);
    const allPersonalDetails = usePersonalDetails();
    const {localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const reportID =
        potentialReportID ??
        ([CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW].find((act) => act === action?.actionName) ? action?.childReportID : undefined);

    // reportID can be an empty string causing Onyx to fetch the whole collection
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [reportFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID || undefined}`);
    // When the search hash changes, report from the snapshot will be undefined if it hasn't been fetched yet.
    // Therefore, we will fall back to reportProp while the data is being fetched.
    const report = reportFromOnyx ?? reportProp;

    const shouldStackHorizontally = !!horizontalStacking;
    const isHorizontalStackingAnObject = shouldStackHorizontally && typeof horizontalStacking !== 'boolean';
    const {isHovered = false, ...horizontalStackingRest} = isHorizontalStackingAnObject ? horizontalStacking : ({} as HorizontalStackingOptions);

    const {
        avatarType: notPreciseAvatarType,
        avatars: unsortedIcons,
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
        chatReportID,
        shouldUseRealActor,
    });

    if (!unsortedIcons.length) {
        return null;
    }

    const {
        layout: avatarType,
        primaryIcon: primaryAvatar,
        secondaryIcon: secondaryAvatar,
    } = getAvatarLayout({
        icons: unsortedIcons,
        avatarType: notPreciseAvatarType,
        shouldStackHorizontally,
        hasCardFeed: !!subscriptCardFeed,
        shouldRequireSecondaryIconName: true,
    });

    // Sorting only reorders a horizontal stack. The other layouts assign meaning to each position — the primary avatar and
    // the subscript/diagonal secondary — so reordering there would swap which icon lands in which slot.
    let icons: IconType[] = unsortedIcons;
    if (sortAvatars && avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL) {
        if (sortAvatars.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME)) {
            icons = sortIconsByName(unsortedIcons, allPersonalDetails, localeCompare);
        } else if (sortAvatars.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.ID)) {
            icons = lodashSortBy(unsortedIcons, (icon) => icon.id);
        }

        if (sortAvatars.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE)) {
            icons = [...icons].reverse();
        }
    }

    if (!primaryAvatar) {
        return null;
    }

    const delegateAccountIDFromAction = source.action?.delegateAccountID;
    const singleAvatar: AvatarIcon = delegateAccountIDFromAction
        ? {
              ...primaryAvatar,
              copilot: {
                  accountID: delegateAccountIDFromAction,
                  actedForAccountID: delegateAccountID,
              },
          }
        : primaryAvatar;

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT_CARD_FEED && subscriptCardFeed) {
        return (
            <SubscriptCardFeedAvatar
                primaryAvatar={primaryAvatar}
                cardFeed={subscriptCardFeed}
                cardFeedIconSize={subscriptCardFeedIconSize}
                size={size}
                containerStyle={noRightMarginOnSubscriptContainer ? styles.mr0 : {}}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT) {
        return (
            <SubscriptAvatar
                primaryAvatar={primaryAvatar}
                secondaryAvatar={secondaryAvatar}
                size={size}
                containerStyle={noRightMarginOnSubscriptContainer ? styles.mr0 : {}}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_HORIZONTAL) {
        return (
            <HorizontalAvatars
                {...horizontalStackingRest}
                isHovered={isHovered}
                size={size}
                icons={icons}
                isInReportAction={isInReportAction}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    if (avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL) {
        return (
            <DiagonalAvatars
                size={size}
                icons={icons}
                isInReportAction={isInReportAction}
                secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
                isHovered={isHovered}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    return (
        <SingleAvatar
            avatar={singleAvatar}
            size={size}
            containerStyles={shouldStackHorizontally ? [] : (singleAvatarContainerStyle ?? StyleUtils.getContainerStyles(size, isInReportAction))}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default ReportActionAvatars;
