import {useKeypadAmountEditorActions} from '@components/KeypadAmountEditor';
import {KeypadAmountEditorActionsContext} from '@components/KeypadAmountEditor/context';
import type {KeypadAmountEditorActionsContextValue} from '@components/KeypadAmountEditor/context/types';

import type {ReactNode} from 'react';

import React from 'react';

import type {ParentOwnedSign} from './useParentOwnedSign';

type ParentOwnedSignActionsProps = {
    /** Text change handler that sees each edit before the root does */
    setNumber: ParentOwnedSign['setNumber'];

    /** Primitives whose text edits go through `setNumber`, typically `KeypadAmountEditor.Input` */
    children: ReactNode;
};

/**
 * Hands the primitives below it the root's actions with the text change handler wrapped, so the adapter can turn a leading minus
 * into a flip of the caller's sign before the root sees the edit. The root and its contract stay unchanged: every other action,
 * and every edit without a caller-owned sign, reaches it as is. Must be rendered inside the KeypadAmountEditor root.
 */
function ParentOwnedSignActions({setNumber, children}: ParentOwnedSignActionsProps) {
    const rootActions = useKeypadAmountEditorActions();

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsContextValue: KeypadAmountEditorActionsContextValue = {
        ...rootActions,
        setNumber: (text: string) => setNumber(text, rootActions.setNumber),
    };

    return <KeypadAmountEditorActionsContext.Provider value={actionsContextValue}>{children}</KeypadAmountEditorActionsContext.Provider>;
}

export default ParentOwnedSignActions;
