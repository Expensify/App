import {createContext, use} from 'react';
import {useContentNavigation} from '@components/PopoverMenu/v2/content/ContentContext';

type SubContextValue = {
    subID: string;
    /** Outermost-to-immediate-parent. Empty at root. */
    ancestorChain: readonly string[];
};

const SubContext = createContext<SubContextValue | null>(null);
SubContext.displayName = 'PopoverMenuSubContext';

function useSubContext(componentName: string): SubContextValue {
    const value = use(SubContext);
    if (!value) {
        throw new Error(`<${componentName}> must be rendered inside <PopoverMenu.Sub>.`);
    }
    return value;
}

function useSubContextOptional(): SubContextValue | null {
    return use(SubContext);
}

function useIsAtActiveLevel(componentName: string): boolean {
    const {currentSubID} = useContentNavigation(componentName);
    const subContext = useSubContextOptional();
    return currentSubID === (subContext?.subID ?? null);
}

function getParentSubID(ctx: SubContextValue): string | null {
    return ctx.ancestorChain.at(-1) ?? null;
}

export {SubContext, useSubContext, useSubContextOptional, useIsAtActiveLevel, getParentSubID};
export type {SubContextValue};
