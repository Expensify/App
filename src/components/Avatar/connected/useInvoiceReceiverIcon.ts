import {PersonalDetailsContext} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDefaultWorkspaceAvatar, getIconsForParticipants} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type {InvoiceReceiver} from '@src/types/onyx/Report';

import {policyAvatarFieldsSelector} from '@selectors/Policy';
import {use} from 'react';

/**
 * Resolves who invoices are sent to into an icon: the person, or the receiving workspace, which stays nameless until its policy row loads.
 * Without a receiver, the unknown account stands in.
 */
function useInvoiceReceiverIcon(invoiceReceiver: InvoiceReceiver | undefined): Icon {
    const defaultAvatars = useDefaultAvatars();
    const [personalDetailsFromSnapshot] = useAllPersonalDetails();
    // On Search, the snapshot can hold a receiver missing from the live list. The live list covers the gap while the snapshot loads.
    const personalDetails = personalDetailsFromSnapshot ?? use(PersonalDetailsContext);
    const invoiceReceiverPolicyID = invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS ? invoiceReceiver.policyID : undefined;
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(invoiceReceiverPolicyID)}`, {selector: policyAvatarFieldsSelector});

    const placeholderIcon: Icon = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: defaultAvatars.FallbackAvatar, name: ''};
    if (invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return (invoiceReceiver.accountID ? getIconsForParticipants([invoiceReceiver.accountID], personalDetails).at(0) : undefined) ?? placeholderIcon;
    }
    if (!invoiceReceiverPolicyID) {
        return placeholderIcon;
    }
    return {
        id: invoiceReceiverPolicyID,
        type: CONST.ICON_TYPE_WORKSPACE,
        name: invoiceReceiverPolicy?.name ?? '',
        source: invoiceReceiverPolicy?.avatarURL ?? getDefaultWorkspaceAvatar(invoiceReceiverPolicy?.name),
    };
}

export default useInvoiceReceiverIcon;
