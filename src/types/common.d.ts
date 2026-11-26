import * as React from 'react';

type RedBrickRoadPendingAction = 'add' | 'delete' | 'update';

type BaseState = {
    success: string;
    errors: {
        [key: string]: string;
    };
    isLoading: boolean;
    pendingAction: RedBrickRoadPendingAction;
};

type Icon = {
    source: string | React.ReactNode;
    type: 'avatar' | 'workspace';
    name: string;
};

export {RedBrickRoadPendingAction, BaseState, Icon};
