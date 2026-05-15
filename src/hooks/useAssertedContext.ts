import {use} from 'react';
import type {Context} from 'react';

/**
 * Throws a hierarchy error when the context is missing.
 * - Component callers (`consumerName = 'PopoverMenu.Item'`) → `<PopoverMenu.Item> must be rendered inside <PopoverMenu.Content>.`
 * - Hook callers (`consumerName = 'useSelectableRow'`) → `useSelectableRow() must be called inside <PopoverMenu.Content>.`
 */
function useAssertedContext<T>(ContextRef: Context<T | null>, consumerName: string, parentDisplayName: string): T {
    const value = use(ContextRef);
    if (value == null) {
        const isHook = consumerName.startsWith('use');
        const prefix = isHook ? `${consumerName}()` : `<${consumerName}>`;
        const verb = isHook ? 'called inside' : 'rendered inside';
        throw new Error(`${prefix} must be ${verb} ${parentDisplayName}.`);
    }
    return value;
}

export default useAssertedContext;
