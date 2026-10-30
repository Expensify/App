import createContextNamespace from '@hooks/createContextNamespace';

import type {AmountFormFieldActionsContextValue, AmountFormFieldStateContextValue} from './types';

const createAmountFormFieldContext = createContextNamespace('AmountFormField');

const [AmountFormFieldStateContext, useAmountFormFieldStateContext] = createAmountFormFieldContext<AmountFormFieldStateContextValue>('State');
const [AmountFormFieldActionsContext, useAmountFormFieldActionsContext] = createAmountFormFieldContext<AmountFormFieldActionsContextValue>('Actions');

function useAmountFormFieldState() {
    return useAmountFormFieldStateContext('useAmountFormFieldState');
}

function useAmountFormFieldActions() {
    return useAmountFormFieldActionsContext('useAmountFormFieldActions');
}

export {AmountFormFieldActionsContext, AmountFormFieldStateContext, useAmountFormFieldActions, useAmountFormFieldState};
