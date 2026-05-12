import {use} from 'react';
import type {Context} from 'react';

/** Throws `${hookName}() must be called inside ${parentDisplayName}.` if the context is missing. */
function useAssertedContext<T>(ContextRef: Context<T | null>, hookName: string, parentDisplayName: string): T {
    const value = use(ContextRef);
    if (value === null) {
        throw new Error(`${hookName}() must be called inside ${parentDisplayName}.`);
    }
    return value;
}

export default useAssertedContext;
