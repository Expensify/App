import HorizontalAvatars from '@components/Avatar/layouts/HorizontalAvatars';
import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import {PersonalDetailsContext} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useStyleUtils from '@hooks/useStyleUtils';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDefaultWorkspaceAvatar, getIconsForParticipants} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type {InvoiceReceiver} from '@src/types/onyx/Report';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {policyAvatarFieldsSelector} from '@selectors/Policy';
import React, {use} from 'react';

import useSortedIcons from './useSortedIcons';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type InvoiceRoomAvatarProps = {
    /** Who the room's invoices are sent to: a person, or another workspace */
    invoiceReceiver: InvoiceReceiver | undefined;

    /** The sending workspace's icon */
    primaryAvatar: Icon;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Color of the row surface behind the avatar. Affects secondary avatar so it blends into the row. */
    backdropColor?: ColorValue;

    /** Container styles for the single-avatar layout. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Container styles for the subscript stack, merged over its size-derived defaults */
    subscriptContainerStyle?: StyleProp<ViewStyle>;

    /** Whether (and how) to stack the sender and the receiver side by side instead of nesting the receiver as the subscript, unless both sides are workspaces */
    horizontalStacking?: HorizontalStackingOptions | boolean;

    /** How to order the avatars before rendering them. Only applies to a horizontal stack, where every avatar sits in an equivalent slot */
    sort?: SortingOption | SortingOption[];

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/** Resolves the receiver's icon: the person, or the receiving workspace, which stays nameless until its policy row loads. */
function getInvoiceReceiverIcon(
    invoiceReceiver: InvoiceReceiver | undefined,
    invoiceReceiverPolicy: Pick<Policy, 'avatarURL' | 'name'> | undefined,
    personalDetails: OnyxEntry<PersonalDetailsList>,
): Icon | undefined {
    if (invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return invoiceReceiver.accountID ? getIconsForParticipants([invoiceReceiver.accountID], personalDetails).at(0) : undefined;
    }
    if (!invoiceReceiver?.policyID) {
        return undefined;
    }
    return {
        id: invoiceReceiver.policyID,
        type: CONST.ICON_TYPE_WORKSPACE,
        name: invoiceReceiverPolicy?.name ?? '',
        source: invoiceReceiverPolicy?.avatarURL ?? getDefaultWorkspaceAvatar(invoiceReceiverPolicy?.name),
    };
}

/** Renders an invoice room's avatars: the sending workspace with the receiver as the subscript, or side by side inside a horizontal stack. */
function InvoiceRoomAvatar({
    invoiceReceiver,
    primaryAvatar,
    size,
    backdropColor,
    containerStyle,
    subscriptContainerStyle,
    horizontalStacking,
    sort,
    fallbackDisplayName,
}: InvoiceRoomAvatarProps) {
    const StyleUtils = useStyleUtils();
    const defaultAvatars = useDefaultAvatars();
    const [personalDetailsFromSnapshot] = useAllPersonalDetails();
    // On Search, the snapshot can hold a receiver missing from the live list. The live list covers the gap while the snapshot loads.
    const personalDetails = personalDetailsFromSnapshot ?? use(PersonalDetailsContext);
    const invoiceReceiverPolicyID = invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS ? invoiceReceiver.policyID : undefined;
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(invoiceReceiverPolicyID)}`, {selector: policyAvatarFieldsSelector});

    // The unknown account, standing in for a missing receiver.
    const receiverIcon = getInvoiceReceiverIcon(invoiceReceiver, invoiceReceiverPolicy, personalDetails) ?? {
        id: CONST.DEFAULT_NUMBER_ID,
        type: CONST.ICON_TYPE_AVATAR,
        source: defaultAvatars.FallbackAvatar,
        name: '',
    };
    const icons = useSortedIcons([primaryAvatar, receiverIcon], sort);
    // Two workspaces always keep the subscript, even when a horizontal stack is requested.
    const isBusinessToBusiness = primaryAvatar.type === CONST.ICON_TYPE_WORKSPACE && !!invoiceReceiverPolicyID;

    if (horizontalStacking && !isBusinessToBusiness) {
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

    // A nameless receiver would render as an empty ring, so the subscript waits until the receiver is known.
    if (receiverIcon.name) {
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

    return (
        <SingleAvatar
            avatar={primaryAvatar}
            size={size}
            containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default InvoiceRoomAvatar;
