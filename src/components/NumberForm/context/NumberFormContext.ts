import createContextNamespace from '@hooks/createContextNamespace';

import type {NumberFormActionsContextValue, NumberFormStateContextValue} from './types';

const createNumberFormContext = createContextNamespace('NumberForm');

const [NumberFormStateContext, useNumberFormStateContext] = createNumberFormContext<NumberFormStateContextValue>('State');
const [NumberFormActionsContext, useNumberFormActionsContext] = createNumberFormContext<NumberFormActionsContextValue>('Actions');

function useNumberFormState() {
    return useNumberFormStateContext('useNumberFormState');
}

function useNumberFormActions() {
    return useNumberFormActionsContext('useNumberFormActions');
}

export {NumberFormActionsContext, NumberFormStateContext, useNumberFormActions, useNumberFormState};
