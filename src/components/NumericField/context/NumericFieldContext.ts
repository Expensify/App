import createContextNamespace from '@hooks/createContextNamespace';

import type {NumericFieldActionsContextValue, NumericFieldStateContextValue} from './types';

const createNumericFieldContext = createContextNamespace('NumericField');

const [NumericFieldStateContext, useNumericFieldStateContext] = createNumericFieldContext<NumericFieldStateContextValue>('State');
const [NumericFieldActionsContext, useNumericFieldActionsContext] = createNumericFieldContext<NumericFieldActionsContextValue>('Actions');

function useNumericFieldState() {
    return useNumericFieldStateContext('useNumericFieldState');
}

function useNumericFieldActions() {
    return useNumericFieldActionsContext('useNumericFieldActions');
}

export {NumericFieldActionsContext, NumericFieldStateContext, useNumericFieldActions, useNumericFieldState};
