import HorizontalAvatars from '@components/Avatar/layouts/HorizontalAvatars';
import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';

import useStyleUtils from '@hooks/useStyleUtils';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type {InvoiceReceiver} from '@src/types/onyx/Report';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

import useInvoiceReceiverIcon from './useInvoiceReceiverIcon';
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
    const receiverIcon = useInvoiceReceiverIcon(invoiceReceiver);
    const invoiceReceiverPolicyID = invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS ? invoiceReceiver.policyID : undefined;
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
