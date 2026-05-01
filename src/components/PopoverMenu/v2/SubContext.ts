import {createContext, use} from 'react';
import {useContentState} from './ContentContext';

type SubContextValue = {
    subId: string;
    /** Ancestor subIds from outermost to immediate parent. Empty for root-level Subs. */
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
    const {
        state: {currentSubId},
    } = useContentState();
    const subContext = useSubContextOptional();
    return currentSubId === (subContext?.subId ?? null);
}

/** Returns the immediate parent's subId, or `null` for root-level Subs. */
function getParentSubId(ctx: SubContextValue): string | null {
    return ctx.ancestorChain.at(-1) ?? null;
}

export {SubContext, useSubContext, useSubContextOptional, useIsAtActiveLevel, getParentSubId};
export type {SubContextValue};
