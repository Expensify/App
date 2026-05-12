import {use} from 'react';
import type {Context} from 'react';

/**
 * Reads a context inside a hook. Throws `${hookName}() must be called inside ${parentDisplayName}.` if missing.
 * The parent display name is supplied by the caller (e.g. `'<PopoverMenu.Sub>'`) so the helper itself stays domain-agnostic.
 */
function useAssertedContext<T>(ContextRef: Context<T | null>, hookName: string, parentDisplayName: string): T {
    const value = use(ContextRef);
    if (value === null) {
        throw new Error(`${hookName}() must be called inside ${parentDisplayName}.`);
    }
    return value;
}

export default useAssertedContext;
