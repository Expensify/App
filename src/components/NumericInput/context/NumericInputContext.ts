import createContextNamespace from '@hooks/createContextNamespace';

import type {NumericInputActionsContextValue, NumericInputStateContextValue} from './types';

const createNumericInputContext = createContextNamespace('NumericInput');

const [NumericInputStateContext, useNumericInputStateContext] = createNumericInputContext<NumericInputStateContextValue>('State');
const [NumericInputActionsContext, useNumericInputActionsContext] = createNumericInputContext<NumericInputActionsContextValue>('Actions');

function useNumericInputState() {
    return useNumericInputStateContext('useNumericInputState');
}

function useNumericInputActions() {
    return useNumericInputActionsContext('useNumericInputActions');
}

export {NumericInputActionsContext, NumericInputStateContext, useNumericInputActions, useNumericInputState};
