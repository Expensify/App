import type CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import type {ColorValue} from 'react-native';
import type {ValueOf} from 'type-fest';

/** Props shared by every avatar layout primitive */
type BaseAvatarProps = {
    /** Size of the avatar(s) to render */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Display name used as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;

    /** Color of the row surface behind the avatar. Affects secondary avatar so it blends into the row. */
    backdropColor?: ColorValue;
};

/** Props shared by the multi-avatar primitives (diagonal and horizontal stacks) */
type MultipleAvatarsProps = BaseAvatarProps & {
    /** Resolved avatar icons to render */
    icons: IconType[];

    /** Whether the avatars are displayed within a report action */
    isInReportAction: boolean;
};

export type {BaseAvatarProps, MultipleAvatarsProps};
