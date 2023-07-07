import {ValueOf} from 'type-fest';
import * as React from 'react';
import CONST from '../../CONST';

type PendingAction = ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>;

type ErrorFields = Record<string | number, Record<string, string>>;

type BaseState = {
    success?: string;

    /** An error message to display to the user */
    errors?: Record<string, string>;
    errorFields?: ErrorFields;

    /** Whether or not data is loading */
    isLoading?: boolean;

    pendingAction?: PendingAction;
};

type Icon = {
    source: React.ReactNode | string;
    type: 'avatar' | 'workspace';
    name: string;
};

export type {BaseState, Icon, PendingAction, ErrorFields};
