import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import type {AvatarSizeName} from '@styles/utils';
import type {SVGAvatarColorStyle} from '@styles/utils/types';
import type {AvatarType} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

type AvatarCommonProps = {
    /** Source for the avatar. Can be a URL or an icon. */
    source?: AvatarSource;

    /** Extra styles to pass to Image */
    imageStyles?: StyleProp<ViewStyle & ImageStyle>;

    /** Additional styles to pass to Icon */
    iconAdditionalStyles?: StyleProp<ViewStyle>;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** Set the size of Avatar */
    size?: AvatarSizeName;

    /**
     * The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'
     * If the avatar is type === workspace, this fill color will be ignored and decided based on the name prop.
     */
    fill?: string;

    /** Test ID for the Avatar component */
    testID?: string;

    /** Optional account id if it's user avatar */
    avatarID?: number | string;
};

type ResolvedAvatarBase = {
    /** Whether the remote image failed to load, forcing the fallback icon. */
    hasImageError: boolean;

    /** Test ID used to locate the fallback avatar icon in end-to-end tests. */
    fallbackAvatarTestID: string;

    /** Callback invoked when the avatar image fails to load. */
    onImageError: () => void;
};

type ResolvedImageAvatar = ResolvedAvatarBase & {
    /** Discriminant marking this as a remote image avatar. */
    isImageSource: true;

    /** URL of the remote avatar image. */
    avatarSource: string;

    /** Icon colors are unused for image avatars. */
    iconColors: null;
};

type ResolvedIconAvatar = ResolvedAvatarBase & {
    /** Discriminant marking this as an SVG icon avatar. */
    isImageSource: false;

    /** Icon asset to render as the avatar. */
    avatarSource: IconAsset;

    /** Fill and background colors for the icon, or null to use the defaults. */
    iconColors: SVGAvatarColorStyle | null;
};

type ResolvedAvatar = ResolvedImageAvatar | ResolvedIconAvatar;

type AvatarBranchCommonProps = {
    /** Size of Avatar */
    size: AvatarSizeName;

    /** Denotes whether it is an avatar or a workspace avatar */
    type: AvatarType;
};

export type {AvatarCommonProps, ResolvedAvatar, AvatarBranchCommonProps};
