import {ValueOf} from 'type-fest';
import {AvatarSource} from '@libs/UserUtils';
import CONST from '@src/CONST';

type PendingAction = ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>;

type ErrorFields = Record<string | number, Record<string, string> | null>;

type Errors = Record<string, string>;

type Icon = {
    source: AvatarSource;
    type: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;
    name: string;
    id?: number;
    fallbackIcon?: AvatarSource;
};

export type {Icon, PendingAction, ErrorFields, Errors};
