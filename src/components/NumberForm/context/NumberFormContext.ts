import createContextNamespace from '@hooks/createContextNamespace';

import type {NumberFormActionsContextValue, NumberFormContext, NumberFormStateContextValue} from './types';

const createNumberFormContext = createContextNamespace('NumberForm');

const [NumberFormStateContext, useNumberFormState] = createNumberFormContext<NumberFormStateContextValue>('State');
const [NumberFormActionsContext, useNumberFormActions] = createNumberFormContext<NumberFormActionsContextValue>('Actions');

function useNumberFormContext(): NumberFormContext {
    return {...useNumberFormState('useNumberFormContext'), ...useNumberFormActions('useNumberFormContext')};
}

export {NumberFormActionsContext, NumberFormStateContext, useNumberFormActions, useNumberFormState, useNumberFormContext};
