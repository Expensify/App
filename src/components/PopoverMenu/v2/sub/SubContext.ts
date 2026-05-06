import {createContext, use} from 'react';
import {useContentNavigation} from '@components/PopoverMenu/v2/content/ContentContext';

type SubContextValue = {
    subID: string;
    /** `null` at the outermost level. */
    parentSubID: string | null;
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

export {SubContext, useSubContext, useSubContextOptional, useIsAtActiveLevel};
export type {SubContextValue};
