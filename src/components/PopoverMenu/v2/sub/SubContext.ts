import {createContext, use} from 'react';
import {useContentNavigation} from '@components/PopoverMenu/v2/content/ContentContext';
import useAssertedContext from '@hooks/useAssertedContext';

type SubContextValue = {
    subID: string;
    /** `null` at the outermost level. */
    parentSubID: string | null;
};

const SubContext = createContext<SubContextValue | null>(null);
SubContext.displayName = 'PopoverMenuSubContext';

const useSubContext = (consumerName: string) => useAssertedContext(SubContext, consumerName, '<PopoverMenu.Sub>');

const useSubContextOptional = (): SubContextValue | null => use(SubContext);

function useIsAtActiveLevel(consumerName = 'useIsAtActiveLevel'): boolean {
    const {currentSubID} = useContentNavigation(consumerName);
    const subContext = useSubContextOptional();
    return currentSubID === (subContext?.subID ?? null);
}

export {SubContext, useSubContext, useSubContextOptional, useIsAtActiveLevel};
export type {SubContextValue};
