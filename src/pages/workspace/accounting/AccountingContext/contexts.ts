import {createContext, useContext} from 'react';

import type {AccountingActionsContextType, AccountingStateContextType} from './types';

import {defaultAccountingActionsContextValue, defaultAccountingStateContextValue} from './default';

/**
 * The contexts and their hooks live here rather than next to the provider so that the integration flow
 * components can read the accounting state without importing the provider, which imports the flow components
 * back through accounting/utils and would close an import cycle.
 */
const AccountingStateContext = createContext<AccountingStateContextType>(defaultAccountingStateContextValue);
const AccountingActionsContext = createContext<AccountingActionsContextType>(defaultAccountingActionsContextValue);

function useAccountingState(): AccountingStateContextType {
    return useContext(AccountingStateContext);
}

function useAccountingActions(): AccountingActionsContextType {
    return useContext(AccountingActionsContext);
}

export {AccountingActionsContext, AccountingStateContext, useAccountingActions, useAccountingState};
