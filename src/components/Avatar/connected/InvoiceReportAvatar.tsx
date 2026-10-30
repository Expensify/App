import DiagonalAvatars from '@components/Avatar/layouts/DiagonalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useStyleUtils from '@hooks/useStyleUtils';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {reportAvatarFieldsSelector, roomAvatarFieldsSelector} from '@selectors/Report';
import {getReportActionByIDSelector} from '@selectors/ReportAction';
import React from 'react';

import useInvoiceReceiverIcon from './useInvoiceReceiverIcon';
import useReportWorkspaceIcon from './useReportWorkspaceIcon';

type InvoiceReportAvatarProps = {
    /** Invoice report whose avatars to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Color of the row surface behind the avatar. Affects secondary avatar so it blends into the row. */
    backdropColor?: ColorValue;

    /** Container styles for the single-avatar layout. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Container styles for the subscript stack, merged over its size-derived defaults */
    subscriptContainerStyle?: StyleProp<ViewStyle>;

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/**
 * Renders an invoice report's avatars: the sending workspace with the receiver as the subscript.
 * Between two workspaces, the pair turns diagonal once the report preview loads.
 */
function InvoiceReportAvatar({reportID, size, backdropColor, containerStyle, subscriptContainerStyle, fallbackDisplayName}: InvoiceReportAvatarProps) {
    const StyleUtils = useStyleUtils();
    const defaultAvatars = useDefaultAvatars();
    const [invoice] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: reportAvatarFieldsSelector});
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
    const [hasReportPreview] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${invoiceRoomID}`, {selector: hasReportPreviewSelector});

    const isIndividualReceiver = invoiceRoom?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
    // Only an archived invoice to a person depends on who sent its expenses, so only then does the sender lookup read the whole rows it needs.
    const isSenderNeeded = isArchived && !!hasReportPreview && isIndividualReceiver;
    const [senderInvoice] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(isSenderNeeded ? reportID : undefined)}`);
    const [senderInvoiceRoom] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(isSenderNeeded ? invoiceRoomID : undefined)}`);
    const reportPreviewSelector = (reportActions: OnyxEntry<ReportActions>) => getReportActionByIDSelector(reportActions, parentReportActionID);
    const [senderReportPreview] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(isSenderNeeded ? invoiceRoomID : undefined)}`, {
        selector: reportPreviewSelector,
    });
    const senderAccountID = useReportPreviewSenderID({iouReport: senderInvoice, action: senderReportPreview, chatReport: senderInvoiceRoom});

    const policyID = invoiceRoom?.policyID ?? invoice?.policyID;
    // The raw policyID, `_FAKE_` included, seeds the default avatar's color and the tooltip. Without one, the unknown account stands in for the workspace.
    const primaryAvatar: Icon = policyID ? {...workspaceIcon, id: policyID} : {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: defaultAvatars.FallbackAvatar, name: ''};
    const isBusinessToBusiness = primaryAvatar.type === CONST.ICON_TYPE_WORKSPACE && receiverIcon.type === CONST.ICON_TYPE_WORKSPACE;
    // An archived invoice to a person shows the receiver only while its preview shows expenses from more than one sender.
    const isReceiverHidden = isArchived && isIndividualReceiver && (!hasReportPreview || !!senderAccountID);

    // A nameless receiver would render as an empty ring, so the workspace shows alone until the receiver is known.
    if (!receiverIcon.name || isReceiverHidden) {
        return (
            <SingleAvatar
                avatar={primaryAvatar}
                size={size}
                containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    if (isBusinessToBusiness && hasReportPreview) {
        return (
            <DiagonalAvatars
                size={size}
                icons={[primaryAvatar, receiverIcon]}
                isInReportAction={false}
                backdropColor={backdropColor}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    return (
        <SubscriptAvatar
            primaryAvatar={primaryAvatar}
            secondaryAvatar={receiverIcon}
            size={size}
            backdropColor={backdropColor}
            containerStyle={subscriptContainerStyle}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default InvoiceReportAvatar;
