import * as React from 'react';

type PendingAction = 'add' | 'delete' | 'update';

type BaseState = {
    success?: string;

    /** An error message to display to the user */
    errors?: Record<string, string>;

    /** Whether or not data is loading */
    isLoading?: boolean;

    pendingAction?: PendingAction;
};

type Icon = {
    source: React.ReactNode | string;
    type: 'avatar' | 'workspace';
    name: string;
};

export type {BaseState, Icon};
