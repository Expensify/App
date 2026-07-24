import type {ConnectionName} from '@src/types/onyx/Policy';

import type {RefObject} from 'react';
import type {View} from 'react-native';

type ActiveIntegration = {
    name: ConnectionName;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: ConnectionName;
};

type ActiveIntegrationState = ActiveIntegration & {key: number};

type AccountingStateContextType = {
    activeIntegration?: ActiveIntegration;
    popoverAnchorRefs: RefObject<Record<string, RefObject<View | null>>>;
};

type AccountingActionsContextType = {
    startIntegrationFlow: (activeIntegration: ActiveIntegration) => void;
};

export type {ActiveIntegration, ActiveIntegrationState, AccountingStateContextType, AccountingActionsContextType};
