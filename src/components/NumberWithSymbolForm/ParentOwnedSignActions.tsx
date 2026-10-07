import {useNumericInputActions} from '@components/NumericInput';
import {NumericInputActionsContext} from '@components/NumericInput/context';
import type {NumericInputActionsContextValue} from '@components/NumericInput/context/types';

import type {ReactNode} from 'react';

import React from 'react';

import type {ParentOwnedSign} from './useParentOwnedSign';

type ParentOwnedSignActionsProps = {
    /** Text change handler that sees each edit before the root does */
    setNumber: ParentOwnedSign['setNumber'];

    /** Primitives whose text edits go through `setNumber`, typically `NumericInput.TextInput` */
    children: ReactNode;
};

/**
 * Hands the primitives below it the root's actions with the text change handler wrapped, so the adapter can turn a leading minus
 * into a flip of the caller's sign before the root sees the edit. The root and its contract stay unchanged: every other action,
 * and every edit without a caller-owned sign, reaches it as is. Must be rendered inside the NumericInput root.
 */
function ParentOwnedSignActions({setNumber, children}: ParentOwnedSignActionsProps) {
    const rootActions = useNumericInputActions();

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsContextValue: NumericInputActionsContextValue = {
        ...rootActions,
        setNumber: (text: string) => setNumber(text, rootActions.setNumber),
    };

    return <NumericInputActionsContext.Provider value={actionsContextValue}>{children}</NumericInputActionsContext.Provider>;
}

export default ParentOwnedSignActions;
