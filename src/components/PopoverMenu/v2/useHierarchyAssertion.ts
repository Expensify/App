import {use} from 'react';
import type {Context} from 'react';

function useHierarchyAssertion<T>(componentName: string, ContextRef: Context<T | null>, parentName: string): void {
    if (use(ContextRef) !== null) {
        return;
    }
    throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.${parentName}>.`);
}

export default useHierarchyAssertion;
