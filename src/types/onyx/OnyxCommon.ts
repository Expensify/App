import {ValueOf} from 'type-fest';
import * as React from 'react';
import CONST from '../../CONST';

type PendingAction = ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>;

type ErrorFields = Record<string | number, Record<string, string>>;

type Errors = Record<string, string>;

type Icon = {
    source: React.ReactNode | string;
    type: 'avatar' | 'workspace';
    name: string;
};

export type {Icon, PendingAction, ErrorFields, Errors};
