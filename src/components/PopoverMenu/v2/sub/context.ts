import {use} from 'react';
import {useContent} from '@components/PopoverMenu/v2/content/ContentContext';
import createContextNamespace from '@hooks/createContextNamespace';

type SubContextValue = {
    subID: string;
    parentSubID: string | null;
    level: number;
};

const [SubContext, useSubContext] = createContextNamespace('PopoverMenu.Sub')<SubContextValue>();

const useSubContextOptional = (): SubContextValue | null => use(SubContext);

function useIsAtActiveLevel(consumerName = 'useIsAtActiveLevel'): boolean {
    const {currentSubID} = useContent(consumerName).state;
    const subContext = useSubContextOptional();
    return currentSubID === (subContext?.subID ?? null);
}

export {SubContext, useSubContext, useSubContextOptional, useIsAtActiveLevel};
export type {SubContextValue};
