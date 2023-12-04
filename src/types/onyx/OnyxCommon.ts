import {ValueOf} from 'type-fest';
import {AvatarSource} from '@libs/UserUtils';
import CONST from '@src/CONST';

type PendingAction = ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>;

type PendingFields<TKey extends string = string> = Record<TKey, PendingAction | null | undefined>;

type ErrorFields<TKey extends string = string> = Record<TKey, Errors | null | undefined>;

type Errors = Record<string, string>;

type Icon = {
    /** Avatar source to display */
    source: AvatarSource;

    /** Denotes whether it is an avatar or a workspace avatar */
    type: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;

    /** Owner of the avatar. If user, displayName. If workspace, policy name */
    name: string;

    /** Avatar id */
    id?: number | string;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: AvatarSource;
};

export type {Icon, PendingAction, PendingFields, ErrorFields, Errors};
