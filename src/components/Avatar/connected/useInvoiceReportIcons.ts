/**
 * Resolves an invoice report's avatars and layout, shared by InvoiceReportAvatar and the invoice preview rows in a chat.
 */
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {reportAvatarFieldsSelector, roomAvatarFieldsSelector} from '@selectors/Report';
import {getReportActionByIDSelector} from '@selectors/ReportAction';

import useInvoiceReceiverIcon from './useInvoiceReceiverIcon';
import useReportWorkspaceIcon from './useReportWorkspaceIcon';

type InvoiceReportLayout = ValueOf<Pick<typeof CONST.REPORT_ACTION_AVATARS.TYPE, 'SINGLE' | 'SUBSCRIPT' | 'MULTIPLE_DIAGONAL'>>;

type InvoiceReportIcons = {
    /** The sending workspace, or the unknown account until the invoice names one */
    primaryAvatar: Icon;

    /** The person or workspace the invoice is sent to */
    receiverIcon: Icon;

    /** How the two avatars show: the workspace alone, the receiver as its subscript, or the two workspaces diagonally */
    layout: InvoiceReportLayout;

    /** Whether the invoice goes from one workspace to another */
    isBusinessToBusiness: boolean;
};

/**
 * Resolves an invoice report's avatars: the sending workspace and the receiver, with the layout they show in.
 * Without a reportID, every read selects nothing.
 * A caller already holding the report preview passes it in, so the hook does not look it up. On Search, the snapshot can hold the preview row without its room's actions.
 */
function useInvoiceReportIcons(reportID: string | undefined, reportPreviewAction?: OnyxEntry<ReportAction>): InvoiceReportIcons {
    const defaultAvatars = useDefaultAvatars();
    const [invoice] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: reportAvatarFieldsSelector});
    const invoiceRoomID = getNonEmptyStringOnyxID(invoice?.chatReportID);
    const [invoiceRoom] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${invoiceRoomID}`, {selector: roomAvatarFieldsSelector});
    // The invoice room carries the workspace, so it comes first. The invoice's own fields cover the gap while the room loads,
    // and its policyID stands in for a room policyID that is missing or `_FAKE_`.
    const roomPolicyID = invoiceRoom?.policyID === CONST.POLICY.ID_FAKE ? undefined : invoiceRoom?.policyID;
    const workspaceIcon = useReportWorkspaceIcon(invoiceRoom ? {...invoiceRoom, policyID: roomPolicyID ?? invoice?.policyID} : invoice);
    const receiverIcon = useInvoiceReceiverIcon(invoiceRoom?.invoiceReceiver);
    const isArchived = useReportIsArchived(reportID);

    const parentReportActionID = invoice?.parentReportActionID;
    const hasReportPreviewSelector = (reportActions: OnyxEntry<ReportActions>) =>
        getReportActionByIDSelector(reportActions, parentReportActionID)?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
    const [hasReportPreviewInRoom] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportPreviewAction ? undefined : invoice?.chatReportID)}`, {
        selector: hasReportPreviewSelector,
    });
    const hasReportPreview = reportPreviewAction ? reportPreviewAction.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW : hasReportPreviewInRoom;

    const isIndividualReceiver = invoiceRoom?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
    // Only an archived invoice to a person depends on who sent its expenses, so only then does the sender lookup read the whole rows it needs.
    const isSenderNeeded = isArchived && !!hasReportPreview && isIndividualReceiver;
    const [senderInvoice] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(isSenderNeeded ? reportID : undefined)}`);
    const [senderInvoiceRoom] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(isSenderNeeded ? invoiceRoomID : undefined)}`);
    const reportPreviewSelector = (reportActions: OnyxEntry<ReportActions>) => getReportActionByIDSelector(reportActions, parentReportActionID);
    const [senderReportPreviewInRoom] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(isSenderNeeded && !reportPreviewAction ? invoiceRoomID : undefined)}`, {
        selector: reportPreviewSelector,
    });
    const senderReportPreview = isSenderNeeded ? (reportPreviewAction ?? senderReportPreviewInRoom) : undefined;
    const senderAccountID = useReportPreviewSenderID({iouReport: senderInvoice, action: senderReportPreview, chatReport: senderInvoiceRoom});

    const policyID = invoiceRoom?.policyID ?? invoice?.policyID;
    // The raw policyID, `_FAKE_` included, seeds the default avatar's color and the tooltip. Without one, the unknown account stands in for the workspace.
    const primaryAvatar: Icon = policyID ? {...workspaceIcon, id: policyID} : {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: defaultAvatars.FallbackAvatar, name: ''};
    const isBusinessToBusiness = primaryAvatar.type === CONST.ICON_TYPE_WORKSPACE && receiverIcon.type === CONST.ICON_TYPE_WORKSPACE;
    // An archived invoice to a person shows the receiver only while its preview shows expenses from more than one sender.
    const isReceiverHidden = isArchived && isIndividualReceiver && (!hasReportPreview || !!senderAccountID);

    let layout: InvoiceReportLayout = CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT;
    // A nameless receiver would render as an empty ring, so the workspace shows alone until the receiver is known.
    if (!receiverIcon.name || isReceiverHidden) {
        layout = CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE;
    } else if (isBusinessToBusiness && hasReportPreview) {
        layout = CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL;
    }

    return {primaryAvatar, receiverIcon, layout, isBusinessToBusiness};
}

export default useInvoiceReportIcons;
