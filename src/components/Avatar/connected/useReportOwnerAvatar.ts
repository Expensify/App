import type {AvatarIcon} from '@components/Avatar/types';

import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDelegateAccountIDFromReportAction} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';

import type {ReportAvatarFields} from '@selectors/Report';
import type {OnyxEntry} from 'react-native-onyx';

import {getReportActionByIDSelector} from '@selectors/ReportAction';

import {useSeededAccountIcons} from './useAccountIcons';

/**
 * Resolves the account a report belongs to into its avatar: the owner, or the copilot badged as acting for the owner
 * when a copilot created the report. The copilot is read off the action that created the report in its chat.
 */
function useReportOwnerAvatar(report: ReportAvatarFields | undefined): AvatarIcon {
    const parentReportActionID = report?.parentReportActionID;
    const delegateAccountIDSelector = (reportActions: OnyxEntry<ReportActions>) => getDelegateAccountIDFromReportAction(getReportActionByIDSelector(reportActions, parentReportActionID));
    // An optimistic expense report links its chat only through chatReportID, an optimistic task only through parentReportID.
    const parentChatReportID = getNonEmptyStringOnyxID(report?.chatReportID) ?? getNonEmptyStringOnyxID(report?.parentReportID);
    const [delegateAccountID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentChatReportID}`, {selector: delegateAccountIDSelector});
    const ownerAccountID = report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [primaryIcon] = useSeededAccountIcons([delegateAccountID ?? ownerAccountID]);

    return delegateAccountID ? {...primaryIcon, copilot: {accountID: delegateAccountID, actedForAccountID: ownerAccountID}} : primaryIcon;
}

export default useReportOwnerAvatar;
