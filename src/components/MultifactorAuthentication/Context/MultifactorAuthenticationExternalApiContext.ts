import {createContext, useContext} from 'react';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from '@components/MultifactorAuthentication/config/types';

/**
 * Trailing args for {@link MultifactorAuthenticationExternalAPI.executeScenario}: the params object is
 * required for scenarios whose params have at least one required field (e.g. AUTHORIZE-TRANSACTION needs
 * `transactionID`) and optional for scenarios whose params are fully optional (e.g. BIOMETRICS-TEST).
 *
 * `Partial<P> extends P` holds only when `P` has no required fields - exactly when the params object is
 * safe to omit.
 */
type MultifactorAuthenticationExecuteScenarioArgs<T extends MultifactorAuthenticationScenario> =
    Partial<MultifactorAuthenticationScenarioParams<T>> extends MultifactorAuthenticationScenarioParams<T>
        ? [params?: MultifactorAuthenticationScenarioParams<T>]
        : [params: MultifactorAuthenticationScenarioParams<T>];

/**
 * The public API for starting an MFA flow from app code (settings pages, test tools, 3DS entry
 * points). Everything that happens after INIT is driven by the machine and exposed to flow-internal
 * screens through MultifactorAuthenticationInternalApiContext.
 */
type MultifactorAuthenticationExternalAPI = {
    /** Execute a multifactor authentication scenario. The params object is required for scenarios that need one. */
    executeScenario: <T extends MultifactorAuthenticationScenario>(scenario: T, ...args: MultifactorAuthenticationExecuteScenarioArgs<T>) => Promise<void>;
};

const MultifactorAuthenticationExternalAPIContext = createContext<MultifactorAuthenticationExternalAPI | undefined>(undefined);

function useMultifactorAuthentication(): MultifactorAuthenticationExternalAPI {
    const context = useContext(MultifactorAuthenticationExternalAPIContext);

    if (!context) {
        throw new Error('useMultifactorAuthentication must be used within a MultifactorAuthenticationContextProviders');
    }

    return context;
}

export default MultifactorAuthenticationExternalAPIContext;
export {useMultifactorAuthentication};
export type {MultifactorAuthenticationExternalAPI, MultifactorAuthenticationExecuteScenarioArgs};
