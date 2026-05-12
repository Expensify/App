import React from 'react';
import type {ReactNode} from 'react';
import RowContext from './RowContext';
import type {RowContextValue} from './RowContext';

type ProviderProps = {
    /** Context value exposed to descendants via `useRowContext()`. */
    value: RowContextValue;

    /** Subtree that consumes the row context. */
    children: ReactNode;
};

function Provider({value, children}: ProviderProps) {
    return <RowContext.Provider value={value}>{children}</RowContext.Provider>;
}

Provider.displayName = 'OptionRow.Provider';

export default Provider;
