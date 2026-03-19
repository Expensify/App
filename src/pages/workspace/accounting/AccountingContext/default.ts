import type {RefObject} from 'react';
import type {View} from 'react-native';
import CONST from '@src/CONST';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type {AccountingActionsContextType, AccountingStateContextType} from './types';

const popoverAnchorRefsInitialValue = Object.values(CONST.POLICY.CONNECTIONS.NAME).reduce(
    (acc, key) => {
        acc[key] = {current: null};
        return acc;
    },
    {} as Record<ConnectionName, RefObject<View | null>>,
);

const defaultAccountingStateContextValue: AccountingStateContextType = {
    activeIntegration: undefined,
    popoverAnchorRefs: {
        current: popoverAnchorRefsInitialValue,
    },
};

const defaultAccountingActionsContextValue: AccountingActionsContextType = {
    startIntegrationFlow: () => {},
};

export {defaultAccountingStateContextValue, defaultAccountingActionsContextValue, popoverAnchorRefsInitialValue};
