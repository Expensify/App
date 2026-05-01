import {createContext, use} from 'react';
import {useContentState} from './ContentContext';

type SubContextValue = {
    subId: string;
};

const SubContext = createContext<SubContextValue | null>(null);
SubContext.displayName = 'PopoverMenuSubContext';

function useSubContext(consumerName = 'usePopoverMenuSubContext'): SubContextValue {
    const value = use(SubContext);
    if (!value) {
        throw new Error(`\`${consumerName}\` must be called inside <PopoverMenu.Sub>`);
    }
    return value;
}

function useSubContextOptional(): SubContextValue | null {
    return use(SubContext);
}

function useIsAtActiveLevel(consumerName?: string): boolean {
    const {
        state: {currentSubId},
    } = useContentState(consumerName);
    const subContext = useSubContextOptional();
    return currentSubId === (subContext?.subId ?? null);
}

export {SubContext, useSubContext, useSubContextOptional, useIsAtActiveLevel};
export type {SubContextValue};
