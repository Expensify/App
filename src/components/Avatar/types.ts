import type {AvatarSource} from '@libs/UserAvatarUtils';

import type {AvatarShape, AvatarSizeName} from '@styles/utils';

import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';

type AvatarCommonProps = {
    /** Source for the avatar. Can be a URL or an icon. */
    source?: AvatarSource;

    /** Extra styles for the rendered image, or for the container of the rendered icon/initials */
    imageStyles?: StyleProp<ViewStyle & ImageStyle>;

    /** Additional styles for the rendered icon/initials, or for the container of the rendered image */
    iconAdditionalStyles?: StyleProp<ViewStyle>;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** Set the size of Avatar */
    size?: AvatarSizeName;

    /** Test ID for the Avatar component */
    testID?: string;
};

type AvatarPrimitivesCommonProps = {
    /** Size of Avatar */
    size: AvatarSizeName;

    /** Shape of the avatar: round for users, rounded square for workspaces */
    shape: AvatarShape;
};

type AvatarIcon = Icon & {
    /** Set when a copilot took the action this avatar represents. The tooltip then reads "<copilot> (as copilot for <actedFor>)". */
    copilot?: {
        /** The copilot's account ID */
        accountID: number;

        /** Account the copilot acted for. Falls back to the avatar's own `id`. */
        actedForAccountID?: number;
    };
};

export type {AvatarCommonProps, AvatarIcon, AvatarPrimitivesCommonProps};
