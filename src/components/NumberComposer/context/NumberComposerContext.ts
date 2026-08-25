import createContextNamespace from '@hooks/createContextNamespace';

import type {NumberComposerActionsContextValue, NumberComposerStateContextValue} from './types';

const createNumberComposerContext = createContextNamespace('NumberComposer');

const [NumberComposerStateContext, useNumberComposerStateContext] = createNumberComposerContext<NumberComposerStateContextValue>('State');
const [NumberComposerActionsContext, useNumberComposerActionsContext] = createNumberComposerContext<NumberComposerActionsContextValue>('Actions');

function useNumberComposerState() {
    return useNumberComposerStateContext('useNumberComposerState');
}

function useNumberComposerActions() {
    return useNumberComposerActionsContext('useNumberComposerActions');
}

export {NumberComposerActionsContext, NumberComposerStateContext, useNumberComposerActions, useNumberComposerState};
