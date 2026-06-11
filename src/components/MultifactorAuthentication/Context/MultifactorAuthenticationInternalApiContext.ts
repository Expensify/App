import {createContext, useContext} from 'react';
import type {MfaState} from '@components/MultifactorAuthentication/machine';

/**
 * The flow-internal API for the screens and navigator hosting an active MFA flow. Every method is a
 * thin wrapper over `send(event)` - no flow logic (the behavior IS machine state). `state` is the
 * machine snapshot mapped to the legacy shape plus `modalPhase`, so existing consumers keep reading
 * `state.X`.
 *
 * Deliberately not exported from the Context barrel: app code starts flows through the external API
 * (useMultifactorAuthentication); only flow-internal screens import this module directly.
 */
type MultifactorAuthenticationInternalApi = {
    /** The current MFA state, derived from the machine snapshot. */
    state: MfaState;

    /** Close the modal overlay. */
    closeModal: () => void;

    /** Navigator's report that the close animation fully finished; re-enters idle, wiping the flow data. */
    notifyModalClosed: () => void;

    /** Centralized back-press / backdrop entry. */
    requestCancel: () => void;

    /** Dismiss the cancel-confirmation modal without cancelling the flow. */
    hideCancelConfirm: () => void;

    /** Confirm cancellation. */
    confirmCancel: () => void;
};

/**
 * Runtime-leaf module: react must stay the only runtime import (type imports are erased).
 * Components reachable from the scenario configs (e.g. OutcomeScreenBase) consume the hook from
 * here; importing it from the Provider module would re-enter the Provider -> config import graph
 * and close an import cycle (config/scenarios -> screens -> Context -> config).
 */
const MultifactorAuthenticationInternalApiContext = createContext<MultifactorAuthenticationInternalApi | undefined>(undefined);

function useMultifactorAuthenticationInternal(): MultifactorAuthenticationInternalApi {
    const context = useContext(MultifactorAuthenticationInternalApiContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationInternal must be used within a MultifactorAuthenticationContextProviders');
    }

    return context;
}

export default MultifactorAuthenticationInternalApiContext;
export {useMultifactorAuthenticationInternal};
export type {MultifactorAuthenticationInternalApi};
