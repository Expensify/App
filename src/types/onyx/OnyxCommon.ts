import * as React from 'react';
import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type PendingAction = ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>;

type PendingFields<TKey extends string = string> = Record<TKey, PendingAction | null | undefined>;

type ErrorFields<TKey extends string = string> = Record<TKey, Errors | null | undefined>;

type Errors = Record<string, string>;

type Icon = {
    source: React.ReactNode | string;
    type: 'avatar' | 'workspace';
    name: string;
};

export type {Icon, PendingAction, PendingFields, ErrorFields, Errors};
