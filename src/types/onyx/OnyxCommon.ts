import {ValueOf} from 'type-fest';
import {AvatarSource} from '@libs/UserUtils';
import CONST from '@src/CONST';

type PendingAction = ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>;

type PendingFields<TKey extends string = string> = Record<TKey, PendingAction | null | undefined>;

type ErrorFields<TKey extends string = string> = Record<TKey, Errors | null | undefined>;

type Errors = Record<string, string>;

type Icon = {
    source: AvatarSource;
    type: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;
    name: string;
    id?: number;
    fallbackIcon?: AvatarSource;
};

export type {Icon, PendingAction, PendingFields, ErrorFields, Errors};
