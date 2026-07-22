import type {AvatarSource} from '@libs/UserAvatarUtils';

import type {AvatarSizeName} from '@styles/utils';

import type {AvatarType} from '@src/types/onyx/OnyxCommon';

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

    /**
     * The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'
     * For workspace avatars this fill color is ignored — the colors are derived from the avatarID prop instead.
     */
    fill?: string;

    /** Test ID for the Avatar component */
    testID?: string;
};

type AvatarPrimitivesCommonProps = {
    /** Size of Avatar */
    size: AvatarSizeName;

    /** Denotes whether it is an avatar or a workspace avatar */
    type: AvatarType;
};

export type {AvatarCommonProps, AvatarPrimitivesCommonProps};
