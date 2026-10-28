import DiagonalAvatars from '@components/Avatar/layouts/DiagonalAvatars';
import HorizontalAvatars from '@components/Avatar/layouts/HorizontalAvatars';
import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import type {AvatarIcon} from '@components/Avatar/types';
import {PersonalDetailsContext} from '@components/OnyxListItemProvider';
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useStyleUtils from '@hooks/useStyleUtils';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDelegateAccountIDFromReportAction} from '@libs/ReportActionsUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, ReportActions} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {getStableReportSelector} from '@selectors/Report';
import {getReportActionByIDSelector} from '@selectors/ReportAction';
import React, {use} from 'react';

import useSortedIcons from './useSortedIcons';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type IOUReportAvatarProps = {
    /** IOU report whose avatars to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Color of the row surface behind the avatar. Affects secondary avatar so it blends into the row. */
    backdropColor?: ColorValue;

    /** Container styles for the single-avatar layout. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether (and how) to stack the manager and the owner side by side. Only a report with more than one sender has both to show */
    horizontalStacking?: HorizontalStackingOptions | boolean;

    /** How to order the avatars before rendering them. Only applies to a horizontal stack, where every avatar sits in an equivalent slot */
    sort?: SortingOption | SortingOption[];

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/** Builds the manager or owner icon: a default avatar seeded from the account ID, named by display name only. */
function getIOUParticipantIcon(accountID: number | undefined, personalDetails: OnyxEntry<PersonalDetailsList>, fallbackAvatar: AvatarSource): Icon {
    const details = accountID ? personalDetails?.[accountID] : undefined;
    return {
        id: accountID,
        type: CONST.ICON_TYPE_AVATAR,
        source: details?.avatar ?? (accountID ? getDefaultAvatarURL({accountID}) : fallbackAvatar),
        name: details?.displayName ?? '',
        fallbackIcon: details?.fallbackIcon,
    };
}

/**
 * Renders an IOU report's avatars. When every expense on the report comes from one person, only that sender shows.
 * Otherwise the manager and the owner show together, diagonally or side by side inside a horizontal stack.
 */
function IOUReportAvatar({reportID, size, backdropColor, containerStyle, horizontalStacking, sort, fallbackDisplayName}: IOUReportAvatarProps) {
    const StyleUtils = useStyleUtils();
    const {formatPhoneNumber, translate} = useLocalize();
    const defaultAvatars = useDefaultAvatars();
    const [personalDetailsFromSnapshot] = useAllPersonalDetails();
    // On Search, the snapshot can hold an account missing from the live list. Fall back to the live list while the snapshot loads.
    const personalDetails = personalDetailsFromSnapshot ?? use(PersonalDetailsContext) ?? undefined;

    // The sender lookup reads the whole IOU report row, so it subscribes without a selector.
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(iouReport?.chatReportID)}`, {selector: getStableReportSelector});
    const parentReportActionID = iouReport?.parentReportActionID;
    const reportPreviewSelector = (reportActions: OnyxEntry<ReportActions>) => getReportActionByIDSelector(reportActions, parentReportActionID);
    const [action] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(chatReport?.reportID ?? iouReport?.chatReportID)}`, {selector: reportPreviewSelector});
    const senderAccountID = useReportPreviewSenderID({iouReport, action, chatReport});

    const reportPreview = action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW ? action : undefined;
    const managerAccountID = iouReport?.managerID;
    const ownerAccountID = iouReport?.ownerAccountID;
    const delegateAccountID = getDelegateAccountIDFromReportAction(reportPreview);
    const delegateDetails = delegateAccountID ? personalDetails?.[delegateAccountID] : undefined;
    // A copilot created the report for its owner. Until the copilot's personal details load, the report reads as the manager's instead.
    const actorAccountID = delegateDetails ? (ownerAccountID ?? reportPreview?.childOwnerAccountID) : (managerAccountID ?? reportPreview?.childManagerAccountID);
    const accountID = senderAccountID || (actorAccountID ?? CONST.DEFAULT_NUMBER_ID);

    // The unknown account stands in while there is no account to picture.
    let primaryAvatar: Icon = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: defaultAvatars.FallbackAvatar, name: ''};
    if (!reportPreview || !accountID) {
        // Until the report preview loads, the manager shows on their own.
        if (managerAccountID) {
            primaryAvatar = getIOUParticipantIcon(managerAccountID, personalDetails, defaultAvatars.FallbackAvatar);
        }
    } else if (delegateDetails) {
        primaryAvatar = {
            id: delegateDetails.accountID,
            type: CONST.ICON_TYPE_AVATAR,
            source: delegateDetails.avatar ?? '',
            name: delegateDetails.displayName,
            fallbackIcon: delegateDetails.fallbackIcon,
        };
    } else {
        const accountDetails = personalDetails?.[accountID];
        primaryAvatar = {
            id: accountID,
            type: CONST.ICON_TYPE_AVATAR,
            source: accountDetails?.avatar ?? defaultAvatars.FallbackAvatar,
            name: getDisplayNameForParticipant({accountID, personalDetailsData: personalDetails, formatPhoneNumber, hiddenTranslation: translate('common.hidden')}),
            fallbackIcon: accountDetails?.fallbackIcon,
        };
    }

    // The second avatar is whichever of the owner and the manager the first one isn't.
    const secondaryAccountID = ownerAccountID === primaryAvatar.id ? managerAccountID : ownerAccountID;
    const secondaryAvatar: Icon = secondaryAccountID
        ? getIOUParticipantIcon(secondaryAccountID, personalDetails, defaultAvatars.FallbackAvatar)
        : {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: '', name: ''};
    const icons = useSortedIcons([primaryAvatar, secondaryAvatar], sort);

    // Without one sender to single out, the report shows both of its accounts.
    const hasSeveralSenders = !!reportPreview && !senderAccountID;

    if (hasSeveralSenders && horizontalStacking) {
        return (
            <HorizontalAvatars
                {...(horizontalStacking === true ? {} : horizontalStacking)}
                size={size}
                icons={icons}
                isInReportAction={false}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    // An owner without a display name has nothing to name in the tooltip, so the manager shows on their own.
    if (hasSeveralSenders && secondaryAvatar.name) {
        return (
            <DiagonalAvatars
                size={size}
                icons={[primaryAvatar, secondaryAvatar]}
                isInReportAction={false}
                backdropColor={backdropColor}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    // The copilot badge names who the copilot acted for, so it shows even before the copilot's personal details load.
    const singleAvatar: AvatarIcon = delegateAccountID && actorAccountID ? {...primaryAvatar, copilot: {accountID: delegateAccountID, actedForAccountID: actorAccountID}} : primaryAvatar;

    return (
        <SingleAvatar
            avatar={singleAvatar}
            size={size}
            containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default IOUReportAvatar;
