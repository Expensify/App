import {createContext, use} from 'react';
import {useContentNavigation} from './ContentContext';

type SubContextValue = {
    subID: string;
    /** Ancestor subIDs from outermost to immediate parent. Empty for root-level Subs. */
    ancestorChain: readonly string[];
};

const SubContext = createContext<SubContextValue | null>(null);
SubContext.displayName = 'PopoverMenuSubContext';

function useSubContext(): SubContextValue {
    const value = use(SubContext);
    if (!value) {
        throw new Error('PopoverMenu hook used outside <PopoverMenu.Sub>');
    }
    return value;
}

function useSubContextOptional(): SubContextValue | null {
    return use(SubContext);
}

function useIsAtActiveLevel(): boolean {
    const {currentSubID} = useContentNavigation();
    const subContext = useSubContextOptional();
    return currentSubID === (subContext?.subID ?? null);
}

/** Returns the immediate parent's subID, or `null` for root-level Subs. */
function getParentSubID(ctx: SubContextValue): string | null {
    return ctx.ancestorChain.at(-1) ?? null;
}

export {SubContext, useSubContext, useSubContextOptional, useIsAtActiveLevel, getParentSubID};
export type {SubContextValue};
