import type {AvatarSource} from '@libs/UserUtils';
import type {AvatarType} from '@src/types/onyx/OnyxCommon';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type FallbackUserDetails = {
    /** The name to display in bold */
    displayName?: string;

    /** The login for the tooltip fallback */
    login?: string;

    /** The avatar for the tooltip fallback */
    avatar?: AvatarSource;

    /** Denotes whether it is an avatar or a workspace avatar */
    type?: AvatarType;
};

type Icon = {
    /** Source for the avatar. Can be a URL or an icon. */
    source?: AvatarSource;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL.
     * If the avatar is type === workspace, this fallback icon will be ignored and decided based on the name prop.
     */
    fallbackIcon?: AvatarSource;

    /** Denotes whether it is an avatar or a workspace avatar */
    type?: AvatarType;

    /** Owner of the avatar. If user, displayName. If workspace, policy name */
    name?: string;
};

type UserDetailsTooltipProps = ChildrenProps & {
    /** User's Account ID */
    accountID: number;

    /** Fallback User Details object used if no accountID */
    fallbackUserDetails?: FallbackUserDetails;

    /** Optionally, pass in the icon instead of calculating it. If defined, will take precedence. */
    icon?: Icon;

    /** The accountID of the copilot who took this action on behalf of the user */
    delegateAccountID?: number;

    /** Any additional amount to manually adjust the horizontal position of the tooltip.
    A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
    shiftHorizontal?: number | (() => number);

    /** Whether the actual UserDetailsTooltip should be rendered. If false, it's just going to return the children */
    shouldRender?: boolean;
};

export default UserDetailsTooltipProps;
