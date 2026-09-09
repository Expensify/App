import CONST from '@src/CONST';
import type {ConnectionName} from '@src/types/onyx/Policy';

import type {RefObject} from 'react';
import type {View} from 'react-native';

import type {AccountingActionsContextType, AccountingStateContextType} from './types';

const popoverAnchorRefsInitialValue = [...CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES, CONST.POLICY.CONNECTIONS.ACCOUNTING_INTEGRATION_ALIASES.INTUIT_ENTERPRISE_SUITE].reduce(
    (acc, key) => {
        acc[key] = {current: null};
        return acc;
    },
    {} as Record<ConnectionName | typeof CONST.POLICY.CONNECTIONS.ACCOUNTING_INTEGRATION_ALIASES.INTUIT_ENTERPRISE_SUITE, RefObject<View | null>>,
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
