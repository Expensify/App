import * as React from 'react';

type RedBrickRoadPendingAction = 'add' | 'delete' | 'update';

type BaseState = {
    success: string;

    /** An error message to display to the user */
    errors?: Record<string, string>;

    /** Whether or not data is loading */
    isLoading: boolean;

    pendingAction: RedBrickRoadPendingAction;
};

type Icon = {
    source: string | React.ReactNode;
    type: 'avatar' | 'workspace';
    name: string;
};

export type {RedBrickRoadPendingAction, BaseState, Icon};
