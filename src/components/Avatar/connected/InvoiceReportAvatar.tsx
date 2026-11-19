import DiagonalAvatars from '@components/Avatar/layouts/DiagonalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';

import useStyleUtils from '@hooks/useStyleUtils';

import CONST from '@src/CONST';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

import useInvoiceReportIcons from './useInvoiceReportIcons';

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
    const {primaryAvatar, receiverIcon, layout} = useInvoiceReportIcons(reportID);

    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE) {
        return (
            <SingleAvatar
                avatar={primaryAvatar}
                size={size}
                containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL) {
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
