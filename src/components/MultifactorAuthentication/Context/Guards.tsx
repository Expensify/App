import React, {createContext, useContext, useMemo} from 'react';
import type {ReactNode} from 'react';
import {useMultifactorAuthenticationState} from './State';

type MultifactorAuthenticationGuards = {
    /** Whether the MagicCode page can be accessed */
    canAccessMagicCode: boolean;

    /** Whether the Prompt page can be accessed */
    canAccessPrompt: boolean;

    /** Whether the Outcome page can be accessed */
    canAccessOutcome: boolean;
};

type MultifactorAuthenticationGuardsContextValue = {
    guards: MultifactorAuthenticationGuards;
};

const MultifactorAuthenticationGuardsContext = createContext<MultifactorAuthenticationGuardsContextValue | undefined>(undefined);

type MultifactorAuthenticationGuardsProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationGuardsProvider({children}: MultifactorAuthenticationGuardsProviderProps) {
    const {state} = useMultifactorAuthenticationState();

    const guards = useMemo((): MultifactorAuthenticationGuards => {
        const {scenario, error, isFlowComplete} = state;

        // Base condition - scenario must be set and flow must be active
        const hasActiveFlow = !!scenario && !isFlowComplete && !error;

        return {
            canAccessMagicCode: hasActiveFlow,
            canAccessPrompt: hasActiveFlow,
            canAccessOutcome: !!scenario && isFlowComplete,
        };
    }, [state]);

    const contextValue = useMemo(
        () => ({
            guards,
        }),
        [guards],
    );

    return <MultifactorAuthenticationGuardsContext.Provider value={contextValue}>{children}</MultifactorAuthenticationGuardsContext.Provider>;
}

function useMultifactorAuthenticationGuards(): MultifactorAuthenticationGuardsContextValue {
    const context = useContext(MultifactorAuthenticationGuardsContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationGuards must be used within a MultifactorAuthenticationGuardsProvider');
    }

    return context;
}

MultifactorAuthenticationGuardsProvider.displayName = 'MultifactorAuthenticationGuardsProvider';

export default MultifactorAuthenticationGuardsProvider;
export {useMultifactorAuthenticationGuards, MultifactorAuthenticationGuardsContext};
export type {MultifactorAuthenticationGuards, MultifactorAuthenticationGuardsContextValue};
