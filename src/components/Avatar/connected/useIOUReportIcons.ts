/**
 * Resolves an IOU report's avatars and layout, shared by IOUReportAvatar and the report preview rows in a chat.
 */
import type {AvatarIcon} from '@components/Avatar/types';
import {PersonalDetailsContext} from '@components/OnyxListItemProvider';
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDelegateAccountIDFromReportAction} from '@libs/ReportActionsUtils';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, ReportAction, ReportActions} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {personalDetailsListSelector} from '@selectors/PersonalDetails';
import {getStableReportSelector} from '@selectors/Report';
import {getReportActionByIDSelector} from '@selectors/ReportAction';
import {use} from 'react';

type IOUReportLayout = ValueOf<Pick<typeof CONST.REPORT_ACTION_AVATARS.TYPE, 'SINGLE' | 'MULTIPLE_DIAGONAL'>>;

type IOUReportIcons = {
    /** The single sender, the copilot who created the report, or the manager until the report preview loads */
    primaryAvatar: Icon;

    /** Whichever of the owner and the manager the primary avatar isn't */
    secondaryAvatar: Icon;

    /** The primary avatar, badged with the copilot when one created the report */
    singleAvatar: AvatarIcon;

    /** Whether the report has no single sender to show, so both of its accounts show together */
    hasSeveralSenders: boolean;

    /** The one account every expense on the report comes from, if there is one */
    senderAccountID: number | undefined;

    /** Both accounts diagonally, or the primary avatar alone. A horizontal stack shows both whenever there are several senders */
    layout: IOUReportLayout;
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
 * Resolves an IOU report's avatars. When every expense on the report comes from one person, that sender is the primary avatar.
 * Otherwise the manager and the owner both show. Without a reportID, every read selects nothing.
 * A caller already holding the report preview passes it in, so the hook does not look it up. On Search, the snapshot can hold the preview row without its chat's actions.
 */
function useIOUReportIcons(reportID: string | undefined, reportPreviewAction?: OnyxEntry<ReportAction>): IOUReportIcons {
    const {formatPhoneNumber, translate} = useLocalize();
    const defaultAvatars = useDefaultAvatars();

    // The sender lookup reads the whole IOU report row, so it subscribes without a selector.
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(iouReport?.chatReportID)}`, {selector: getStableReportSelector});
    const parentReportActionID = iouReport?.parentReportActionID;
    const reportPreviewSelector = (reportActions: OnyxEntry<ReportActions>) => getReportActionByIDSelector(reportActions, parentReportActionID);
    const [actionFromChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportPreviewAction ? undefined : (chatReport?.reportID ?? iouReport?.chatReportID))}`, {
        selector: reportPreviewSelector,
    });
    const action = reportPreviewAction ?? actionFromChat;
    const senderAccountID = useReportPreviewSenderID({iouReport, action, chatReport});

    const reportPreview = action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW ? action : undefined;
    const managerAccountID = iouReport?.managerID;
    const ownerAccountID = iouReport?.ownerAccountID;
    const delegateAccountID = getDelegateAccountIDFromReportAction(reportPreview);
    // Only the accounts the report can picture are read, so a change to anyone else's details doesn't re-render the avatar.
    const accountIDs = [managerAccountID, ownerAccountID, reportPreview?.childManagerAccountID, reportPreview?.childOwnerAccountID, delegateAccountID, senderAccountID];
    // On Search, the snapshot can hold an account missing from the live list. Fall back to the live list while the snapshot loads.
    const [personalDetailsFromSnapshot] = useAllPersonalDetails((personalDetailsList) => (personalDetailsList ? personalDetailsListSelector(accountIDs)(personalDetailsList) : undefined));
    const personalDetails = personalDetailsFromSnapshot ?? use(PersonalDetailsContext) ?? undefined;
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
    // The copilot badge names who the copilot acted for, so it shows even before the copilot's personal details load.
    const singleAvatar: AvatarIcon = delegateAccountID && actorAccountID ? {...primaryAvatar, copilot: {accountID: delegateAccountID, actedForAccountID: actorAccountID}} : primaryAvatar;

    // Without one sender to single out, the report shows both of its accounts.
    const hasSeveralSenders = !!reportPreview && !senderAccountID;

    return {
        primaryAvatar,
        secondaryAvatar,
        singleAvatar,
        hasSeveralSenders,
        senderAccountID,
        // An owner without a display name has nothing to name in the tooltip, so the manager shows on their own.
        layout: hasSeveralSenders && secondaryAvatar.name ? CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL : CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
    };
}

export default useIOUReportIcons;
