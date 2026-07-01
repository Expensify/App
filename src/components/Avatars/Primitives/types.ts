import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

/** Props shared by every avatar layout primitive */
type BaseAvatarProps = {
    /** Size of the avatar(s) to render */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Whether to show the user-details tooltip on hover */
    shouldShowTooltip: boolean;

    /** Display name used as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;

    /** Whether clicking the avatar navigates to the profile/workspace page */
    shouldUseProfileNavigationWrapper?: boolean;

    /** Report ID used for avatar navigation */
    reportID?: string;
};

/** Props shared by the multi-avatar primitives (diagonal and horizontal stacks) */
type MultipleAvatarsProps = BaseAvatarProps & {
    /** Resolved avatar icons to render */
    icons: IconType[];

    /** Whether the avatars are displayed within a report action */
    isInReportAction: boolean;
};

export type {BaseAvatarProps, MultipleAvatarsProps};
