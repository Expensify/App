import * as React from 'react';
import {SvgProps} from 'react-native-svg';
import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type PendingAction = ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>;

type ErrorFields = Record<string | number, Record<string, string> | null>;

type Errors = Record<string, string>;

type Icon = {
    source: string | React.FC<SvgProps>;
    type: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;
    name: string;
    id: number | string;
    fallbackIcon?: string | React.FC<SvgProps>;
};

export type {Icon, PendingAction, ErrorFields, Errors};
