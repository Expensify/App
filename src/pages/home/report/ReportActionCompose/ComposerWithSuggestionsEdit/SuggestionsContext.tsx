import type {MutableRefObject, ReactNode} from 'react';
import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';
import type {SuggestionsRef} from '@pages/home/report/ReportActionCompose/ReportActionCompose';

type SuggestionsContextProviderProps = {
    children?: ReactNode;
};

type SuggestionsContextProps = {
    activeID: string | null;
    currentActiveSuggestionsRef: MutableRefObject<SuggestionsRef | null>;
    updateCurrentActiveSuggestionsRef: (ref: SuggestionsRef | null, id: string) => void;
    clearActiveSuggestionsRef: () => void;
    isActiveSuggestions: (id: string) => boolean;
};

const SuggestionsContext = createContext<SuggestionsContextProps>({
    activeID: null,
    currentActiveSuggestionsRef: {current: null},
    updateCurrentActiveSuggestionsRef: () => {},
    clearActiveSuggestionsRef: () => {},
    isActiveSuggestions: () => false,
});

function SuggestionsContextProvider({children}: SuggestionsContextProviderProps) {
    const currentActiveSuggestionsRef = useRef<SuggestionsRef | null>(null);
    const [activeID, setActiveID] = useState<string | null>(null);

    const updateCurrentActiveSuggestionsRef = useCallback((ref: SuggestionsRef | null, id: string) => {
        currentActiveSuggestionsRef.current = ref;
        setActiveID(id);
    }, []);

    const clearActiveSuggestionsRef = useCallback(() => {
        currentActiveSuggestionsRef.current = null;
        setActiveID(null);
    }, []);

    const isActiveSuggestions = useCallback((id: string) => id === activeID, [activeID]);

    const contextValue = useMemo(
        () => ({activeID, currentActiveSuggestionsRef, updateCurrentActiveSuggestionsRef, clearActiveSuggestionsRef, isActiveSuggestions}),
        [activeID, currentActiveSuggestionsRef, updateCurrentActiveSuggestionsRef, clearActiveSuggestionsRef, isActiveSuggestions],
    );

    return <SuggestionsContext.Provider value={contextValue}>{children}</SuggestionsContext.Provider>;
}

function useSuggestionsContext() {
    const context = useContext(SuggestionsContext);
    return context;
}

SuggestionsContextProvider.displayName = 'PlaybackContextProvider';

export {SuggestionsContextProvider, useSuggestionsContext};
