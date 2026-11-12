import createContextNamespace from '@hooks/createContextNamespace';

import type {KeypadAmountEditorActionsContextValue, KeypadAmountEditorStateContextValue} from './types';

const createKeypadAmountEditorContext = createContextNamespace('KeypadAmountEditor');

const [KeypadAmountEditorStateContext, useKeypadAmountEditorStateContext] = createKeypadAmountEditorContext<KeypadAmountEditorStateContextValue>('State');
const [KeypadAmountEditorActionsContext, useKeypadAmountEditorActionsContext] = createKeypadAmountEditorContext<KeypadAmountEditorActionsContextValue>('Actions');

function useKeypadAmountEditorState() {
    return useKeypadAmountEditorStateContext('useKeypadAmountEditorState');
}

function useKeypadAmountEditorActions() {
    return useKeypadAmountEditorActionsContext('useKeypadAmountEditorActions');
}

export {KeypadAmountEditorActionsContext, KeypadAmountEditorStateContext, useKeypadAmountEditorActions, useKeypadAmountEditorState};
