import React, {createContext, useContext} from 'react';
import type {ReactNode} from 'react';
import type {UnknownRecord} from 'type-fest';
import type {MultifactorAuthenticationScenario} from './config/types';

const MultifactorAuthenticationContext = createContext<{
    proceed: (scenario: MultifactorAuthenticationScenario) => MultifactorAuthenticationScenario;
    update: (props: UnknownRecord) => void;
    trigger: (type: unknown) => void;
    info: {
        scenario: MultifactorAuthenticationScenario;
        headerTitle: string;
        title: string;
        description: string;
    };
}>({
    proceed: (scenario) => scenario,
    update: () => {},
    trigger: () => {},
    info: {
        scenario: 'BIOMETRICS-TEST',
        headerTitle: 'Header title',
        title: 'Title',
        description: 'Description',
    },
});

type MultifactorAuthenticationContextProviderProps = {
    /**
     * The children of the full-screen loader context provider.
     */
    children: ReactNode;
};

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const MultifactorAuthenticationContextData = {
        proceed: (scenario: MultifactorAuthenticationScenario) => scenario,
        update: () => {},
        trigger: () => {},
        info: {
            scenario: 'BIOMETRICS-TEST',
            headerTitle: 'Header title',
            title: 'Title',
            description: 'Description',
        },
    };

    return <MultifactorAuthenticationContext.Provider value={MultifactorAuthenticationContextData}>{children}</MultifactorAuthenticationContext.Provider>;
}

function useMultifactorAuthenticationContext() {
    const context = useContext(MultifactorAuthenticationContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationContext must be used within a MultifactorAuthenticationContextProvider');
    }

    return context;
}

MultifactorAuthenticationContextProvider.displayName = 'MultifactorAuthenticationContextProvider';

export default MultifactorAuthenticationContextProvider;
export {MultifactorAuthenticationContext, useMultifactorAuthenticationContext};
