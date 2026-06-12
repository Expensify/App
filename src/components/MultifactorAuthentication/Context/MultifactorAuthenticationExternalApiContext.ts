import {createContext, useContext} from 'react';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from '@components/MultifactorAuthentication/config/types';

/**
 * The public API for starting an MFA flow from app code (settings pages, test tools, 3DS entry
 * points). Everything that happens after INIT is driven by the machine and exposed to flow-internal
 * screens through MultifactorAuthenticationInternalApiContext.
 */
type MultifactorAuthenticationExternalApi = {
    /** Execute a multifactor authentication scenario. */
    executeScenario: <T extends MultifactorAuthenticationScenario>(scenario: T, params?: MultifactorAuthenticationScenarioParams<T>) => Promise<void>;
};

const MultifactorAuthenticationExternalApiContext = createContext<MultifactorAuthenticationExternalApi | undefined>(undefined);

function useMultifactorAuthentication(): MultifactorAuthenticationExternalApi {
    const context = useContext(MultifactorAuthenticationExternalApiContext);

    if (!context) {
        throw new Error('useMultifactorAuthentication must be used within a MultifactorAuthenticationContextProviders');
    }

    return context;
}

export default MultifactorAuthenticationExternalApiContext;
export {useMultifactorAuthentication};
export type {MultifactorAuthenticationExternalApi};
