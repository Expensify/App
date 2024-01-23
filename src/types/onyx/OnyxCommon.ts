import type {ValueOf} from 'type-fest';
import type {AvatarSource} from '@libs/UserUtils';
import type CONST from '@src/CONST';

type PendingAction = ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION> | null;

type PendingFields<TKey extends string> = {[key in Exclude<TKey, 'pendingAction' | 'pendingFields'>]?: PendingAction};

type OfflineFeedback<TKey extends string = string> = {
    /** The type of action that's pending  */
    pendingAction?: PendingAction;

    /** Field-specific pending states for offline updates */
    pendingFields?: PendingFields<TKey>;
};

type OnyxValueWithOfflineFeedback<TOnyx, TKey extends string = string> = TOnyx & OfflineFeedback<TKey>;

type ErrorFields<TKey extends string = string> = Record<TKey, Errors | null | undefined>;

type Errors = Record<string, string>;

type AvatarType = typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;

type Icon = {
    /** Avatar source to display */
    source: AvatarSource;

    /** Denotes whether it is an avatar or a workspace avatar */
    type: AvatarType;

    /** Owner of the avatar. If user, displayName. If workspace, policy name */
    name: string;

    /** Avatar id */
    id?: number | string;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: AvatarSource;
};

export type {Icon, PendingAction, ErrorFields, Errors, AvatarType, OfflineFeedback, OnyxValueWithOfflineFeedback};
