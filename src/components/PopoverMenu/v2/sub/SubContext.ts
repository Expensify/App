import {useContentNavigation} from '@components/PopoverMenu/v2/content/ContentContext';

import createContextNamespace from '@hooks/createContextNamespace';

import {use} from 'react';

type SubContextValue = {
    subID: string;
    /** `null` at the outermost level. */
    parentSubID: string | null;
};

const [SubContext, useSubContext] = createContextNamespace('PopoverMenu.Sub')<SubContextValue>();

const useSubContextOptional = (): SubContextValue | null => use(SubContext);

function useIsAtActiveLevel(consumerName = 'useIsAtActiveLevel'): boolean {
    const {currentSubID} = useContentNavigation(consumerName);
    const subContext = useSubContextOptional();
    return currentSubID === (subContext?.subID ?? null);
}

export {SubContext, useSubContext, useSubContextOptional, useIsAtActiveLevel};
export type {SubContextValue};
