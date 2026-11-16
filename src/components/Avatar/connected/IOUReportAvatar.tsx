import DiagonalAvatars from '@components/Avatar/layouts/DiagonalAvatars';
import HorizontalAvatars from '@components/Avatar/layouts/HorizontalAvatars';
import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';

import useStyleUtils from '@hooks/useStyleUtils';

import CONST from '@src/CONST';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

import useIOUReportIcons from './useIOUReportIcons';
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

/**
 * Renders an IOU report's avatars. When every expense on the report comes from one person, only that sender shows.
 * Otherwise the manager and the owner show together, diagonally or side by side inside a horizontal stack.
 */
function IOUReportAvatar({reportID, size, backdropColor, containerStyle, horizontalStacking, sort, fallbackDisplayName}: IOUReportAvatarProps) {
    const StyleUtils = useStyleUtils();
    const {primaryAvatar, secondaryAvatar, singleAvatar, hasSeveralSenders, layout} = useIOUReportIcons(reportID);
    const icons = useSortedIcons([primaryAvatar, secondaryAvatar], sort);

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

    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE_DIAGONAL) {
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
